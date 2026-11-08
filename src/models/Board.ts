import mongoose, { Schema, type Document } from "mongoose";

export interface BoardDocument extends Document {
  name: string;
  description?: string;
  content?: string;
  userId: string;
  teamId?: mongoose.Types.ObjectId;
  linkedFolderId?: string;
  /** Appearance shared by everyone on the board (src/lib/board-themes.ts). */
  icon?: string;
  theme?: string;
  /** Custom theme: uploaded wallpaper URL and the "mine" note colour. */
  themeImage?: string;
  themeColor?: string;
  themeOpacity?: number;
  themeBlur?: boolean;
  cardCount?: number;
  createdAt: Date;
  updatedAt: Date;
  userRole?: "owner" | "editor" | "viewer";
}

const BoardSchema = new Schema<BoardDocument>(
  {
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
    userId: {
      type: String,
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },
    linkedFolderId: {
      type: String,
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 16,
    },
    theme: {
      type: String,
      enum: [
        "default",
        "night-garden",
        "waves",
        "meadow",
        "dusk",
        "aurora",
        "library",
        "blueprint",
        "candy",
        "custom",
      ],
      default: "default",
    },
    themeImage: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    themeColor: {
      type: String,
      trim: true,
      match: /^#[0-9a-fA-F]{6}$/,
    },
    themeOpacity: {
      type: Number,
      min: 0.2,
      max: 1,
    },
    themeBlur: {
      type: Boolean,
    },
    cardCount: {
      type: Number,
      default: 0,
    },
    userRole: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "owner",
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
BoardSchema.index({ userId: 1 });
BoardSchema.index({ createdAt: -1 });
BoardSchema.index({ linkedFolderId: 1 });

export default mongoose.models.Board ??
  mongoose.model<BoardDocument>("Board", BoardSchema);
