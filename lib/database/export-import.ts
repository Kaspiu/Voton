import { getDB } from "./database";
import {
  getAllFolders,
  getAllPages,
  notifyChanges,
  notifyDelete,
} from "./documents";
import { Folder, Page } from "./types";

export interface VotonExportData {
  version: string;
  exportDate: string;
  pages: Page[];
  folders: Folder[];
}

// Exports all user data to a JSON file
export async function exportData(): Promise<void> {
  const link = document.createElement("a");
  let url: string | null = null;

  try {
    const pages = await getAllPages();
    const folders = await getAllFolders();
    const exportTimestamp = new Date().toISOString();
    const exportDate = exportTimestamp.split("T")[0];
    const votonData: VotonExportData = {
      version: "2.0.36",
      exportDate: exportTimestamp,
      pages,
      folders,
    };
    const jsonString = JSON.stringify(votonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `voton-export-${exportDate}.json`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
  } finally {
    if (link.parentNode) {
      document.body.removeChild(link);
    }

    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

// Imports user data from a JSON file
export async function importData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.multiple = false;
    input.style.display = "none";

    const cleanup = () => {
      window.removeEventListener("focus", onFocus);

      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    const onFocus = () => {
      setTimeout(() => {
        if (input.files && input.files.length === 0) {
          cleanup();
          reject(new Error("No file selected"));
        }
      }, 300);
    };
    window.addEventListener("focus", onFocus);

    input.onchange = async (event) => {
      cleanup();

      try {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        if (!file.name.endsWith(".json")) {
          reject(new Error("Invalid file format. Please select a .json file"));
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonString = e.target?.result as string;

            if (!jsonString) {
              throw new Error("File is empty or could not be read.");
            }

            const votonData = JSON.parse(jsonString) as VotonExportData;

            if (!validateExportData(votonData)) {
              throw new Error("Invalid export file format");
            }

            const db = await getDB();
            const tx = db.transaction(["pages", "folders"], "readwrite");
            const pagesStore = tx.objectStore("pages");
            const foldersStore = tx.objectStore("folders");

            await Promise.all([
              ...votonData.pages.map((page) => pagesStore.put(page)),
              ...votonData.folders.map((folder) => foldersStore.put(folder)),
            ]);
            await tx.done;

            notifyChanges();
            resolve();
          } catch (error) {
            reject(error);
            cleanup();
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
          cleanup();
        };

        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    };
    document.body.appendChild(input);
    input.click();
  });
}

// Clears all data from the database
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["pages", "folders"], "readwrite");

  await Promise.all([
    tx.objectStore("pages").clear(),
    tx.objectStore("folders").clear(),
  ]);

  await tx.done;
  notifyDelete();
}

// Validates the imported data structure
export function validateExportData(data: unknown): data is VotonExportData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const votonData = data as VotonExportData;

  if (
    typeof votonData.version !== "string" ||
    typeof votonData.exportDate !== "string" ||
    !Array.isArray(votonData.pages) ||
    !Array.isArray(votonData.folders)
  ) {
    return false;
  }

  const optionalPageProps: (keyof Page)[] = [
    "parentFolder",
    "content",
    "coverImage",
    "icon",
  ];

  // Validate pages
  const arePagesValid = votonData.pages.every((page) => {
    if (
      !page ||
      typeof page !== "object" ||
      Array.isArray(page) ||
      typeof page.id !== "string" ||
      typeof page.title !== "string"
    ) {
      return false;
    }

    const areStringsValid = optionalPageProps.every(
      (prop) => !(prop in page) || typeof page[prop] === "string",
    );

    if (!areStringsValid) {
      return false;
    }

    if ("updatedAt" in page && typeof page.updatedAt !== "number") {
      return false;
    }

    return true;
  });

  const optionalFolderProps: (keyof Folder)[] = ["parentFolder", "color"];

  // Validate folders
  const areFoldersValid = votonData.folders.every((folder) => {
    if (
      !folder ||
      typeof folder !== "object" ||
      Array.isArray(folder) ||
      typeof folder.id !== "string" ||
      typeof folder.title !== "string"
    ) {
      return false;
    }

    const areStringsValid = optionalFolderProps.every(
      (prop) => !(prop in folder) || typeof folder[prop] === "string",
    );

    if (!areStringsValid) {
      return false;
    }

    return true;
  });

  return arePagesValid && areFoldersValid;
}
