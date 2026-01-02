// Defines the structure for a page document.
export interface Page {
  id: string;
  title: string;
  parentFolder?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
  updatedAt?: number;
}

// Defines the structure for a folder.
export interface Folder {
  id: string;
  title: string;
  parentFolder?: string;
  color?: string;
}
