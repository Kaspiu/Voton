import { DBSchema, IDBPDatabase, openDB } from "idb";
import { Folder, Page } from "./types";

const DB_NAME = "VotonDB";
const DB_VERSION = 2;

interface VotonDBSchema extends DBSchema {
  pages: {
    key: string;
    value: Page;
    indexes: {
      parentFolder: string;
      title: string;
    };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: {
      parentFolder: string;
    };
  };
}

let dbInstance: IDBPDatabase<VotonDBSchema> | null = null;

// Initialize the database instance
export async function initializeDB(): Promise<IDBPDatabase<VotonDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<VotonDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      const pagesStore = !db.objectStoreNames.contains("pages")
        ? db.createObjectStore("pages", { keyPath: "id" })
        : transaction.objectStore("pages");

      if (!pagesStore.indexNames.contains("parentFolder")) {
        pagesStore.createIndex("parentFolder", "parentFolder", {
          unique: false,
        });
      }
      if (!pagesStore.indexNames.contains("title")) {
        pagesStore.createIndex("title", "title", { unique: false });
      }

      const foldersStore = !db.objectStoreNames.contains("folders")
        ? db.createObjectStore("folders", { keyPath: "id" })
        : transaction.objectStore("folders");

      if (!foldersStore.indexNames.contains("parentFolder")) {
        foldersStore.createIndex("parentFolder", "parentFolder", {
          unique: false,
        });
      }
    },
  });

  return dbInstance;
}

// Get the database instance
export async function getDB(): Promise<IDBPDatabase<VotonDBSchema>> {
  if (!dbInstance) {
    return await initializeDB();
  }
  return dbInstance;
}
