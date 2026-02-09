import { getDB } from "./database";
import { Page, Folder } from "./types";

// Generates a unique page ID
export function generatePageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Generates a unique folder ID
export function generateFolderId(): string {
  return `folder_${Date.now()}`;
}

// Dispatches item-changed event
export const notifyChanges = () => {
  window.dispatchEvent(new CustomEvent("item-changed"));
};

// Dispatches item-deleted event
export const notifyDelete = () => {
  window.dispatchEvent(new CustomEvent("item-deleted"));
};

// Adds a new page
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

// Adds a new folder
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

// Gets a page by ID
export async function getPage(id: string): Promise<Page | undefined> {
  const db = await getDB();
  return await db.get("pages", id);
}

// Gets a folder by ID
export async function getFolder(id: string): Promise<Folder | undefined> {
  const db = await getDB();
  return await db.get("folders", id);
}

// Gets all pages
export async function getAllPages(): Promise<Page[]> {
  const db = await getDB();
  return await db.getAll("pages");
}

// Gets pages without a parent
export async function getRootPages(): Promise<Page[]> {
  const db = await getDB();
  const allPages = await db.getAll("pages");
  return allPages.filter((page) => !page.parentFolder);
}

// Gets child pages for a parent
export async function getChildPages(parentId: string): Promise<Page[]> {
  const db = await getDB();
  const tx = db.transaction("pages", "readonly");
  const index = tx.store.index("parentFolder");
  return await index.getAll(parentId);
}

// Gets all folders
export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return await db.getAll("folders");
}

// Gets folders without a parent
export async function getRootFolders(): Promise<Folder[]> {
  const db = await getDB();
  const allFolders = await db.getAll("folders");
  return allFolders.filter((folder) => !folder.parentFolder);
}

// Gets child folders for a parent
export async function getChildFolders(parentId: string): Promise<Folder[]> {
  const db = await getDB();
  const tx = db.transaction("folders", "readonly");
  const index = tx.store.index("parentFolder");
  return await index.getAll(parentId);
}

// Updates a page
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

// Updates a folder
export async function updateFolder(
  id: string,
  updates: Partial<Omit<Folder, "id">>,
): Promise<Folder | null> {
  const db = await getDB();
  const existingFolder = await db.get("folders", id);

  if (!existingFolder) {
    return null;
  }

  const updatedFolder: Folder = {
    ...existingFolder,
    ...updates,
  };

  await db.put("folders", updatedFolder);
  notifyChanges();
  return updatedFolder;
}

// Deletes a page
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

// Recursively deletes a folder and its contents
export async function deleteFolderWithChildren(id: string): Promise<boolean> {
  const db = await getDB();
  const folder = await db.get("folders", id);

  if (!folder) {
    return false;
  }

  // Get all child pages
  const childPages = await getChildPages(id);
  for (const child of childPages) {
    await deletePage(child.id);
  }

  // Get all child folders
  const childFolders = await getChildFolders(id);
  for (const child of childFolders) {
    await deleteFolderWithChildren(child.id);
  }

  // Delete the folder itself
  await db.delete("folders", id);
  notifyDelete();
  return true;
}
