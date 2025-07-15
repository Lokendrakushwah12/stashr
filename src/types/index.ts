export interface Bookmark {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Folder {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  bookmarks: Bookmark[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateBookmarkRequest {
  title: string;
  url: string;
  description?: string;
  folderId: string;
} 