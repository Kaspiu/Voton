// Defines the structure for a page document.
export interface Page {
  id: string;
  title: string;
  parentDocument?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
}
