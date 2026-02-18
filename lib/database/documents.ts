import { getDB } from "./database";
import { Folder, Page } from "./types";

// Generates a unique page ID using a timestamp and random suffix.
export function generatePageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Generates a unique folder ID using a timestamp.
export function generateFolderId(): string {
  return `folder_${Date.now()}`;
}

// Dispatches a custom event on window to signal that an item was created or updated.
export const notifyChanges = (): void => {
  window.dispatchEvent(new CustomEvent("item-changed"));
};

// Dispatches a custom event on window to signal that an item was deleted.
export const notifyDelete = (): void => {
  window.dispatchEvent(new CustomEvent("item-deleted"));
};

// Adds a new page to the database and returns the created page.
export async function addPage(page: Omit<Page, "id">): Promise<Page> {
  const db = await getDB();
  const newPage: Page = {
    id: generatePageId(),
    ...page,
    updatedAt: Date.now(),
  };

  await db.add("pages", newPage);
  notifyChanges();
  return newPage;
}

// Adds a new folder to the database and returns the created folder.
export async function addFolder(folder: Omit<Folder, "id">): Promise<Folder> {
  const db = await getDB();
  const newFolder: Folder = {
    id: generateFolderId(),
    ...folder,
  };

  await db.add("folders", newFolder);
  notifyChanges();
  return newFolder;
}

// Returns a page by ID, or undefined if not found.
export async function getPage(id: string): Promise<Page | undefined> {
  const db = await getDB();
  return db.get("pages", id);
}

// Returns a folder by ID, or undefined if not found.
export async function getFolder(id: string): Promise<Folder | undefined> {
  const db = await getDB();
  return db.get("folders", id);
}

// Returns all pages in the database.
export async function getAllPages(): Promise<Page[]> {
  const db = await getDB();
  return db.getAll("pages");
}

// Returns all folders in the database.
export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return db.getAll("folders");
}

// Returns all pages that have no parent folder.
export async function getRootPages(): Promise<Page[]> {
  const pages = await getAllPages();
  return pages.filter((page) => !page.parentFolder);
}

// Returns all folders that have no parent folder.
export async function getRootFolders(): Promise<Folder[]> {
  const folders = await getAllFolders();
  return folders.filter((folder) => !folder.parentFolder);
}

// Returns all pages whose parentFolder matches the given ID.
export async function getChildPages(parentId: string): Promise<Page[]> {
  const db = await getDB();
  const tx = db.transaction("pages", "readonly");
  return tx.store.index("parentFolder").getAll(parentId);
}

// Returns all folders whose parentFolder matches the given ID.
export async function getChildFolders(parentId: string): Promise<Folder[]> {
  const db = await getDB();
  const tx = db.transaction("folders", "readonly");
  return tx.store.index("parentFolder").getAll(parentId);
}

// Merges updates into an existing page, refreshes updatedAt, and persists it. Returns null if not found.
export async function updatePage(
  id: string,
  updates: Partial<Omit<Page, "id">>,
): Promise<Page | null> {
  const db = await getDB();
  const existingPage = await db.get("pages", id);

  if (!existingPage) {
    return null;
  }

  const updatedPage: Page = {
    ...existingPage,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.put("pages", updatedPage);
  notifyChanges();
  return updatedPage;
}

// Merges updates into an existing folder and persists it. Returns null if not found.
export async function updateFolder(
  id: string,
  updates: Partial<Omit<Folder, "id">>,
): Promise<Folder | null> {
  const db = await getDB();
  const existingFolder = await db.get("folders", id);

  if (!existingFolder) {
    return null;
  }

  const updatedFolder: Folder = { ...existingFolder, ...updates };

  await db.put("folders", updatedFolder);
  notifyChanges();
  return updatedFolder;
}

// Deletes a page by ID. Returns false if not found.
export async function deletePage(id: string): Promise<boolean> {
  const db = await getDB();
  const page = await db.get("pages", id);

  if (!page) {
    return false;
  }

  await db.delete("pages", id);
  notifyDelete();
  return true;
}

// Recursively deletes a folder, all its descendant pages, and all its descendant folders. Returns false if not found.
export async function deleteFolderWithChildren(id: string): Promise<boolean> {
  const db = await getDB();
  const folder = await db.get("folders", id);

  if (!folder) {
    return false;
  }

  const childPages = await getChildPages(id);
  for (const child of childPages) {
    await deletePage(child.id);
  }

  const childFolders = await getChildFolders(id);
  for (const child of childFolders) {
    await deleteFolderWithChildren(child.id);
  }

  await db.delete("folders", id);
  notifyDelete();
  return true;
}
