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
  userRole?: 'owner' | 'editor' | 'viewer';
}

export interface FolderCollaboration {
  _id?: string;
  folderId: string;
  userId: string;
  email: string;
  role: 'editor' | 'viewer';
  invitedByUserId: string;
  invitedByUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Board {
  _id?: string;
  name: string;
  description?: string;
  content?: string;
  userId?: string;
  linkedFolderId?: string;
  linkedFolder?: {
    id: string;
    name: string;
    color: string;
  };
  cards?: BoardCard[];
  cardCount?: number;
  createdAt?: string;
  updatedAt?: string;
  userRole?: 'owner' | 'editor' | 'viewer';
}

export interface BoardCard {
  _id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  linkedFolderId?: string; // Reference to bookmark folder
  linkedFolder?: {
    id: string;
    name: string;
    color: string;
  };
  boardId: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
