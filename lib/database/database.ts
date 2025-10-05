import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Page } from "./types";

const DB_NAME = "VotonDB";
const DB_VERSION = 1;

interface VotonDBSchema extends DBSchema {
  pages: {
    key: string;
    value: Page;
    indexes: {
      parentDocument: string;
      title: string;
    };
  };
}

let dbInstance: IDBPDatabase<VotonDBSchema> | null = null;

// Initializes and returns the IndexedDB database instance.
export async function initializeDB(): Promise<IDBPDatabase<VotonDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<VotonDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pages")) {
        const pagesStore = db.createObjectStore("pages", { keyPath: "id" });

        pagesStore.createIndex("parentDocument", "parentDocument", {
          unique: false,
        });

        pagesStore.createIndex("title", "title", { unique: false });
      }
    },
  });

  return dbInstance;
}

// Retrieves the existing database instance or initializes it if it doesn't exist.
export async function getDB(): Promise<IDBPDatabase<VotonDBSchema>> {
  if (!dbInstance) {
    return await initializeDB();
  }

  return dbInstance;
}
