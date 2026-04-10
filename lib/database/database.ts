import { DBSchema, IDBPDatabase, IDBPTransaction, openDB } from "idb";

import { Folder, Page } from "./types";

const DB_NAME = "VotonDB";
const DB_VERSION = 5;

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
      title: string;
    };
  };
}

type UpgradeTransaction = IDBPTransaction<
  VotonDBSchema,
  ("pages" | "folders")[],
  "versionchange"
>;

let dbInstance: IDBPDatabase<VotonDBSchema> | null = null;

// Creates the pages and folders object stores and their indexes if they don't already exist.
function upgradeDB(
  db: IDBPDatabase<VotonDBSchema>,
  transaction: UpgradeTransaction,
): void {
  const pagesStore = db.objectStoreNames.contains("pages")
    ? transaction.objectStore("pages")
    : db.createObjectStore("pages", { keyPath: "id" });

  if (!pagesStore.indexNames.contains("parentFolder")) {
    pagesStore.createIndex("parentFolder", "parentFolder", { unique: false });
  }
  if (!pagesStore.indexNames.contains("title")) {
    pagesStore.createIndex("title", "title", { unique: false });
  }

  const foldersStore = db.objectStoreNames.contains("folders")
    ? transaction.objectStore("folders")
    : db.createObjectStore("folders", { keyPath: "id" });

  if (!foldersStore.indexNames.contains("parentFolder")) {
    foldersStore.createIndex("parentFolder", "parentFolder", { unique: false });
  }
  if (!foldersStore.indexNames.contains("title")) {
    foldersStore.createIndex("title", "title", { unique: false });
  }
}

// Opens the database, runs schema upgrades if needed, caches and returns the instance.
export async function initializeDB(): Promise<IDBPDatabase<VotonDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<VotonDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      upgradeDB(db, transaction as UpgradeTransaction);
    },
  });

  return dbInstance;
}

// Returns the cached database instance, initializing it if necessary.
export async function getDB(): Promise<IDBPDatabase<VotonDBSchema>> {
  if (!dbInstance) {
    return initializeDB();
  }
  return dbInstance;
}
