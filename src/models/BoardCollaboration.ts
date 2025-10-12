import mongoose, { Schema, Document } from 'mongoose';

export interface BoardCollaborationDocument extends Document {
  boardId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userImage?: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BoardCollaborationSchema = new Schema<BoardCollaborationDocument>({
  boardId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: false,
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
    trim: true,
  },
  userImage: {
    type: String,
  },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    required: true,
    default: 'viewer',
  },
  invitedBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    required: true,
    default: 'pending',
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
BoardCollaborationSchema.index({ boardId: 1, userEmail: 1 });
BoardCollaborationSchema.index({ boardId: 1, status: 1 });
BoardCollaborationSchema.index({ userEmail: 1, status: 1 });

const BoardCollaboration = mongoose.models.BoardCollaboration ?? mongoose.model<BoardCollaborationDocument>('BoardCollaboration', BoardCollaborationSchema);

// Sync indexes on initialization (development only)
if (process.env.NODE_ENV !== 'production') {
  BoardCollaboration.syncIndexes().catch((error) => {
    console.error('Error syncing BoardCollaboration indexes:', error);
  });
}

export default BoardCollaboration;
