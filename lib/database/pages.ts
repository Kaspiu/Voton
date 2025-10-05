import { getDB } from "./database";
import { Page } from "./types";

// Generates a unique ID for a page.
export function generatePageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Dispatches an event to notify about page changes.
export const notifyChanges = () => {
  window.dispatchEvent(new CustomEvent("page-changed"));
};

// Dispatches an event to notify about page deletions.
export const notifyDelete = () => {
  window.dispatchEvent(new CustomEvent("page-deleted"));
};

// Adds a new page to the database.
export async function addPage(page: Omit<Page, "id">): Promise<Page> {
  const db = await getDB();
  const newPage: Page = {
    id: generatePageId(),
    ...page,
  };

  await db.add("pages", newPage);
  notifyChanges();
  return newPage;
}

// Retrieves a single page by its ID.
export async function getPage(id: string): Promise<Page | undefined> {
  const db = await getDB();
  return await db.get("pages", id);
}

// Retrieves all pages from the database.
export async function getAllPages(): Promise<Page[]> {
  const db = await getDB();
  return await db.getAll("pages");
}

// Retrieves all pages that do not have a parent.
export async function getRootPages(): Promise<Page[]> {
  const db = await getDB();
  const allPages = await db.getAll("pages");
  return allPages.filter((page) => !page.parentDocument);
}

// Retrieves all child pages for a given parent ID.
export async function getChildPages(parentId: string): Promise<Page[]> {
  const db = await getDB();
  const tx = db.transaction("pages", "readonly");
  const index = tx.store.index("parentDocument");
  return await index.getAll(parentId);
}

// Updates an existing page with new data.
export async function updatePage(
  id: string,
  updates: Partial<Omit<Page, "id">>
): Promise<Page | null> {
  const db = await getDB();
  const existingPage = await db.get("pages", id);

  if (!existingPage) {
    return null;
  }

  const updatedPage: Page = {
    ...existingPage,
    ...updates,
  };

  await db.put("pages", updatedPage);
  notifyChanges();
  return updatedPage;
}

// Deletes a single page from the database.
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

// Recursively deletes a page and all its descendants.
export async function deletePageWithChildren(id: string): Promise<boolean> {
  const db = await getDB();

  // Get all child pages
  const childPages = await getChildPages(id);

  // Recursively delete all children
  for (const child of childPages) {
    await deletePageWithChildren(child.id);
  }

  // Delete the page itself
  return await deletePage(id);
}
