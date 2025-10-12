import type { BookmarkDocument, FolderDocument, FolderCollaborationDocument, BoardDocument, BoardCardDocument, BoardCollaborationDocument, BoardTimelineEntryDocument } from '@/types/database';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';

// This file ensures all models are loaded
export async function registerModels() {
  // Dynamically import models to ensure they're registered
  await Promise.all([
    import('@/models/Folder'),
    import('@/models/Bookmark'),
    import('@/models/FolderCollaboration'),
    import('@/models/Board'),
    import('@/models/BoardCard'),
    import('@/models/BoardCollaboration'),
    import('@/models/BoardTimelineEntry')
  ]);

  return {
    Folder: mongoose.models.Folder as Model<FolderDocument>,
    Bookmark: mongoose.models.Bookmark as Model<BookmarkDocument>,
    FolderCollaboration: mongoose.models.FolderCollaboration as Model<FolderCollaborationDocument>,
    Board: mongoose.models.Board as Model<BoardDocument>,
    BoardCard: mongoose.models.BoardCard as Model<BoardCardDocument>,
    BoardCollaboration: mongoose.models.BoardCollaboration as Model<BoardCollaborationDocument>,
    BoardTimelineEntry: mongoose.models.BoardTimelineEntry as Model<BoardTimelineEntryDocument>
  };
}