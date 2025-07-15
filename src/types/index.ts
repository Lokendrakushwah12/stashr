export interface Bookmark {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  userId?: string;
  folderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Folder {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  userId?: string;
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

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
  
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
} 