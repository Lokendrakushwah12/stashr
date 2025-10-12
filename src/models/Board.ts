import mongoose, { Schema, Document } from 'mongoose';

export interface BoardDocument extends Document {
  name: string;
  description?: string;
  content?: string;
  color?: string;
  userId: string;
  linkedFolderId?: string;
  cardCount?: number;
  createdAt: Date;
  updatedAt: Date;
  userRole?: 'owner' | 'editor' | 'viewer';
}

const BoardSchema = new Schema<BoardDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  content: {
    type: String,
    trim: true,
    maxlength: 10000,
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  userId: {
    type: String,
    required: true,
  },
  linkedFolderId: {
    type: String,
    index: true,
  },
  cardCount: {
    type: Number,
    default: 0,
  },
  userRole: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'owner',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
BoardSchema.index({ userId: 1 });
BoardSchema.index({ createdAt: -1 });
BoardSchema.index({ linkedFolderId: 1 });

export default mongoose.models.Board ?? mongoose.model<BoardDocument>('Board', BoardSchema);
