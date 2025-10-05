import { getDB } from "./database";
import { getAllPages, notifyDelete } from "./pages";
import { Page } from "./types";

export interface VotonExportData {
  version: string;
  exportDate: string;
  pages: Page[];
}

// Exports all user data to a downloadable JSON file.
export async function exportData(): Promise<void> {
  const link = document.createElement("a");
  let url: string | null = null;

  try {
    const pages = await getAllPages();
    const exportTimestamp = new Date().toISOString();
    const exportDate = exportTimestamp.split("T")[0];
    const data: VotonExportData = {
      version: "1.0.0",
      exportDate: exportTimestamp,
      pages,
    };
    const jsonString = JSON.stringify(data, null, 2);
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

// Imports user data from a JSON file after clearing existing data.
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

            const data = JSON.parse(jsonString) as VotonExportData;

            if (!validateExportData(data)) {
              throw new Error("Invalid export file format");
            }

            await clearAllData();

            const db = await getDB();
            const tx = db.transaction("pages", "readwrite");

            await Promise.all(data.pages.map((page) => tx.store.add(page)));
            await tx.done;

            notifyDelete();
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

// Clears all data from the 'pages' object store in the database.
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const pagesTx = db.transaction("pages", "readwrite");

  await pagesTx.store.clear();
  await pagesTx.done;

  notifyDelete();
}

// Validates the structure and types of the imported data object.
export function validateExportData(data: unknown): data is VotonExportData {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as VotonExportData).version !== "string" ||
    typeof (data as VotonExportData).exportDate !== "string" ||
    !Array.isArray((data as VotonExportData).pages)
  ) {
    return false;
  }

  const pages = (data as VotonExportData).pages;
  return pages.every((page) => {
    if (
      !page ||
      typeof page !== "object" ||
      typeof page.id !== "string" ||
      typeof page.title !== "string" ||
      Array.isArray(page)
    ) {
      return false;
    }

    const optionalStringProps: (keyof Page)[] = [
      "parentDocument",
      "content",
      "coverImage",
      "icon",
    ];
    return optionalStringProps.every(
      (prop) => !(prop in page) || typeof page[prop] === "string"
    );
  });
}
