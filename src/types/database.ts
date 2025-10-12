import type { Document, Model } from 'mongoose';
import type mongoose from 'mongoose';

// Database Document Types - These extend Mongoose Document
export interface BookmarkDocument extends Document {
  title: string;
  url: string;
  description: string;
  favicon: string;
  metaImage?: string; // Add meta image field
  userId: string;
  folderId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderDocument extends Document {
  name: string;
  description: string;
  color: string;
  userId: string;
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderCollaborationDocument extends Document {
  folderId: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  role: 'editor' | 'viewer';
  invitedByUserId: string;
  invitedByUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardDocument extends Document {
  name: string;
  description?: string;
  content?: string;
  color?: string;
  userId: string;
  cardCount?: number;
  linkedFolderId?: string;
  createdAt: Date;
  updatedAt: Date;
  userRole?: 'owner' | 'editor' | 'viewer';
  linkedFolder?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface BoardCardDocument extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  linkedFolderId?: string;
  boardId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCollaborationDocument extends Document {
  boardId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userImage?: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardTimelineEntryDocument extends Document {
  boardId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string;
  userRole: 'owner' | 'editor' | 'viewer';
  content: string;
  action: 'created' | 'updated' | 'commented';
  previousContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database Model Types
export type BookmarkModel = Model<BookmarkDocument>;
export type FolderModel = Model<FolderDocument>;
export type FolderCollaborationModel = Model<FolderCollaborationDocument>;
export type BoardModel = Model<BoardDocument>;
export type BoardCardModel = Model<BoardCardDocument>;
export type BoardCollaborationModel = Model<BoardCollaborationDocument>;
export type BoardTimelineEntryModel = Model<BoardTimelineEntryDocument>; 