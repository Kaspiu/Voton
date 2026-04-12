import { getDB } from "./database";
import {
  addPage,
  getAllFolders,
  getAllPages,
  notifyChanges,
  notifyDelete,
} from "./documents";
import { Folder, Page } from "./types";

const EXPORT_VERSION = "0.2.53";
const ACCEPTED_FILE_TYPES = ".json,.md";

export interface VotonExportData {
  version: string;
  exportDate: string;
  pages: Page[];
  folders: Folder[];
}

const OPTIONAL_PAGE_PROPS: (keyof Page)[] = [
  "parentFolder",
  "content",
  "coverImage",
  "icon",
];

const OPTIONAL_FOLDER_PROPS: (keyof Folder)[] = ["parentFolder", "color"];

// Returns true if every optional string prop on a page is either absent or a string, and createdAt and updatedAt are absent or numbers.
function isValidPage(page: unknown): page is Page {
  if (!page || typeof page !== "object" || Array.isArray(page)) return false;

  const p = page as Page;
  if (typeof p.id !== "string" || typeof p.title !== "string") return false;

  const stringsValid = OPTIONAL_PAGE_PROPS.every(
    (prop) => !(prop in p) || typeof p[prop] === "string",
  );
  if (!stringsValid) return false;

  if (
    (p.createdAt !== undefined && typeof p.createdAt !== "number") ||
    (p.updatedAt !== undefined && typeof p.updatedAt !== "number")
  )
    return false;

  return true;
}

// Returns true if every optional string prop on a folder is either absent or a string.
function isValidFolder(folder: unknown): folder is Folder {
  if (!folder || typeof folder !== "object" || Array.isArray(folder))
    return false;

  const f = folder as Folder;
  if (typeof f.id !== "string" || typeof f.title !== "string") return false;

  return OPTIONAL_FOLDER_PROPS.every(
    (prop) => !(prop in f) || typeof f[prop] === "string",
  );
}

// Returns true if the data object conforms to the VotonExportData structure with valid pages and folders.
export function validateExportData(data: unknown): data is VotonExportData {
  if (!data || typeof data !== "object") return false;

  const d = data as VotonExportData;

  if (
    typeof d.version !== "string" ||
    typeof d.exportDate !== "string" ||
    !Array.isArray(d.pages) ||
    !Array.isArray(d.folders)
  ) {
    return false;
  }

  return d.pages.every(isValidPage) && d.folders.every(isValidFolder);
}

// Reads all pages and folders from the database, serializes them to JSON, and triggers a file download.
export async function exportData(): Promise<void> {
  const link = document.createElement("a");
  let url: string | null = null;

  try {
    const [pages, folders] = await Promise.all([
      getAllPages(),
      getAllFolders(),
    ]);
    const exportTimestamp = new Date().toISOString();
    const exportDate = exportTimestamp.split("T")[0];

    const votonData: VotonExportData = {
      version: EXPORT_VERSION,
      exportDate: exportTimestamp,
      pages,
      folders,
    };

    const blob = new Blob([JSON.stringify(votonData, null, 2)], {
      type: "application/json",
    });

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

// Parses and validates a JSON file, then upserts all its pages and folders into the database.
async function processJsonFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
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

        const existingPages = await getAllPages();
        const existingPagesMap = new Map(existingPages.map((p) => [p.id, p]));

        const db = await getDB();
        const tx = db.transaction(["pages", "folders"], "readwrite");

        await Promise.all([
          ...votonData.pages.map((page) => {
            const existing = existingPagesMap.get(page.id);

            if (!existing) {
              return tx.objectStore("pages").put(page);
            }

            if (
              page.updatedAt &&
              existing.updatedAt &&
              page.updatedAt > existing.updatedAt
            ) {
              return tx.objectStore("pages").put(page);
            }

            return Promise.resolve();
          }),
          ...votonData.folders.map((folder) =>
            tx.objectStore("folders").put(folder),
          ),
        ]);

        await tx.done;

        notifyChanges();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Reads a Markdown file and creates a new page with the filename as title and file content as content.
async function processMarkdownFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const markdownContent = e.target?.result as string;

        if (!markdownContent) {
          throw new Error("File is empty or could not be read.");
        }

        const title = file.name.slice(0, file.name.lastIndexOf("."));

        await addPage({ title, content: markdownContent });
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Opens a file picker, reads the selected JSON file, and imports its pages and folders into the database.
export async function importData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_FILE_TYPES;
    input.multiple = false;
    input.style.display = "none";

    const cleanup = () => {
      window.removeEventListener("focus", onWindowFocus);
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    const onWindowFocus = () => {
      setTimeout(() => {
        if (input.files && input.files.length === 0) {
          cleanup();
          reject(new Error("No file selected"));
        }
      }, 300);
    };

    window.addEventListener("focus", onWindowFocus);

    input.onchange = async (event) => {
      cleanup();

      try {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        if (file.name.endsWith(".json")) {
          await processJsonFile(file);
          resolve();
          return;
        }

        if (file.name.endsWith(".md")) {
          await processMarkdownFile(file);
          resolve();
          return;
        }

        reject(
          new Error("Invalid file format. Please select a .json or .md file"),
        );
      } catch (error) {
        reject(error);
      }
    };

    document.body.appendChild(input);
    input.click();
  });
}

// Deletes all pages and folders from the database and dispatches a delete notification.
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
