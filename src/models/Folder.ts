import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';

export interface FolderDocument extends Document {
  name: string;
  description: string;
  color: string;
  userId: string;
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new mongoose.Schema<FolderDocument>(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
      validate: {
        validator: function(v: string) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Please provide a valid hex color code'
      }
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark',
    }],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique folder names per user
folderSchema.index({ userId: 1, name: 1 }, { unique: true });

export type FolderModel = Model<FolderDocument>;

export default mongoose.models.Folder as FolderModel ?? mongoose.model<FolderDocument>('Folder', folderSchema); 