// Model Types - These represent the data structures used throughout the application
export interface Bookmark {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  userId?: string;
  folderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Folder {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  userId?: string;
  bookmarks: Bookmark[];
  createdAt?: string;
  updatedAt?: string;
} 