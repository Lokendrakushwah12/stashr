import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';

export interface BookmarkDocument extends Document {
  title: string;
  url: string;
  description: string;
  favicon: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new mongoose.Schema<BookmarkDocument>(
  {
    title: {
      type: String,
      required: [true, 'Bookmark title is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Bookmark URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid URL'
      }
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    favicon: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to set favicon if not provided
bookmarkSchema.pre('save', function(next) {
  if (!this.favicon && this.url) {
    try {
      const urlObj = new URL(this.url);
      this.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      // Invalid URL will be caught by mongoose validation
    }
  }
  next();
});

export type BookmarkModel = Model<BookmarkDocument>;

export default mongoose.models.Bookmark as BookmarkModel ?? mongoose.model<BookmarkDocument>('Bookmark', bookmarkSchema); 