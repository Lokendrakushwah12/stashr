import mongoose, { Document, Schema, Model } from 'mongoose';

export interface FolderDocument extends Document {
  name: string;
  description?: string;
  color: string;
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<FolderDocument>(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6', // Default blue color
      validate: {
        validator: function(v: string) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Please provide a valid hex color code'
      }
    },
    bookmarks: [{
      type: Schema.Types.ObjectId,
      ref: 'Bookmark',
    }],
  },
  {
    timestamps: true,
  }
);

// Properly type the model
const FolderModel: Model<FolderDocument> = mongoose.models.Folder || mongoose.model<FolderDocument>('Folder', FolderSchema);
export default FolderModel; 