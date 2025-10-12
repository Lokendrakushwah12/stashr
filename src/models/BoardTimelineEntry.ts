import mongoose, { Schema, Document } from 'mongoose';

export interface BoardTimelineEntryDocument extends Document {
  boardId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string;
  userRole: 'owner' | 'editor' | 'viewer';
  content: string;
  action: 'created' | 'updated' | 'commented';
  previousContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BoardTimelineEntrySchema = new Schema<BoardTimelineEntryDocument>({
  boardId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  userImage: {
    type: String,
  },
  userRole: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'commented'],
    required: true,
    default: 'updated',
  },
  previousContent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
BoardTimelineEntrySchema.index({ boardId: 1, createdAt: -1 });
BoardTimelineEntrySchema.index({ userId: 1, createdAt: -1 });

const BoardTimelineEntry = mongoose.models.BoardTimelineEntry ?? mongoose.model<BoardTimelineEntryDocument>('BoardTimelineEntry', BoardTimelineEntrySchema);

export default BoardTimelineEntry;
