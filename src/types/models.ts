// Model Types - These represent the data structures used throughout the application
export interface Bookmark {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  metaImage?: string; // Add meta image field for Open Graph/Twitter card images
  userId: string;
  folderId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Folder {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  userId?: string;
  bookmarks?: Bookmark[];
  bookmarkCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FolderCollaboration {
  _id?: string;
  folderId: string;
  userId: string;
  email: string;
  role: 'editor' | 'viewer';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: Date;
  updatedAt?: Date;
} 