import mongoose, { Document, Schema, Model } from 'mongoose';

export interface BookmarkDocument extends Document {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<BookmarkDocument>(
  {
    title: {
      type: String,
      required: [true, 'Bookmark title is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Bookmark URL is required'],
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
      trim: true,
    },
    favicon: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Properly type the model
const BookmarkModel: Model<BookmarkDocument> = mongoose.models.Bookmark || mongoose.model<BookmarkDocument>('Bookmark', BookmarkSchema);
export default BookmarkModel; 