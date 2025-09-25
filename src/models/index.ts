import type { BookmarkDocument, FolderDocument, FolderCollaborationDocument } from '@/types/database';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';

// This file ensures all models are loaded
export async function registerModels() {
  // Check if models are already registered
  if (mongoose.models.Folder && mongoose.models.Bookmark && mongoose.models.FolderCollaboration) {
    return {
      Folder: mongoose.models.Folder as Model<FolderDocument>,
      Bookmark: mongoose.models.Bookmark as Model<BookmarkDocument>,
      FolderCollaboration: mongoose.models.FolderCollaboration as Model<FolderCollaborationDocument>
    };
  }

  // Dynamically import models to ensure they're registered
  const [{ default: Folder }, { default: Bookmark }, { default: FolderCollaboration }] = await Promise.all([
    import('@/models/Folder'),
    import('@/models/Bookmark'),
    import('@/models/FolderCollaboration')
  ]);

  return { Folder, Bookmark, FolderCollaboration };
}