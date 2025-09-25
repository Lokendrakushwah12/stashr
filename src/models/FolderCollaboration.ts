import type { FolderCollaborationDocument, FolderCollaborationModel } from '@/types/database';
import mongoose from 'mongoose';

const folderCollaborationSchema = new mongoose.Schema<FolderCollaborationDocument>(
  {
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: [true, 'Folder ID is required'],
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor',
      required: true,
    },
    invitedByUserId: {
      type: String,
      required: [true, 'Invited by user ID is required'],
    },
    invitedByUserName: {
      type: String,
      required: [true, 'Invited by user name is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique collaboration per folder per user
folderCollaborationSchema.index({ folderId: 1, userId: 1 }, { unique: true });

// Index for efficient queries
folderCollaborationSchema.index({ userId: 1, status: 1 });
folderCollaborationSchema.index({ folderId: 1, status: 1 });

export default mongoose.models.FolderCollaboration as FolderCollaborationModel ?? 
  mongoose.model<FolderCollaborationDocument>('FolderCollaboration', folderCollaborationSchema);
