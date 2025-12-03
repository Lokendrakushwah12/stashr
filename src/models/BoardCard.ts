import mongoose, { Schema, type Document } from 'mongoose';

export interface BoardCardDocument extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  linkedFolderId?: string;
  boardId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const BoardCardSchema = new Schema<BoardCardDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  linkedFolderId: {
    type: String,
  },
  boardId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
BoardCardSchema.index({ boardId: 1 });
BoardCardSchema.index({ userId: 1 });
BoardCardSchema.index({ status: 1 });
BoardCardSchema.index({ createdAt: -1 });

export default mongoose.models.BoardCard ?? mongoose.model<BoardCardDocument>('BoardCard', BoardCardSchema);
