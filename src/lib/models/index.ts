import type { BookmarkDocument } from '@/models/Bookmark';
import type { FolderDocument } from '@/models/Folder';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';

// This file ensures all models are loaded
export async function registerModels() {
  // Check if models are already registered
  if (mongoose.models.Folder && mongoose.models.Bookmark) {
    return {
      Folder: mongoose.models.Folder as Model<FolderDocument>,
      Bookmark: mongoose.models.Bookmark as Model<BookmarkDocument>
    };
  }

  // Dynamically import models to ensure they're registered
  const [{ default: Folder }, { default: Bookmark }] = await Promise.all([
    import('@/models/Folder'),
    import('@/models/Bookmark')
  ]);

  return { Folder, Bookmark };
}