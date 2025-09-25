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

// Database Model Types
export type BookmarkModel = Model<BookmarkDocument>;
export type FolderModel = Model<FolderDocument>;
export type FolderCollaborationModel = Model<FolderCollaborationDocument>; 