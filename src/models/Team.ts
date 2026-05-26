import mongoose, { Schema, type Document } from "mongoose";

export type TeamTheme = "default" | "ocean" | "forest" | "custom";

export interface TeamDocument extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  ownerId: string;
  planId: "free" | "pro";
  theme: TeamTheme;
  /** Hex color (e.g. "#4f46e5"); only meaningful when theme === "custom". */
  customColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<TeamDocument>(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    theme: {
      type: String,
      enum: ["default", "ocean", "forest", "custom"],
      default: "default",
    },
    customColor: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

TeamSchema.index({ ownerId: 1, slug: 1 }, { unique: true });

export default (mongoose.models.Team as mongoose.Model<TeamDocument>) ??
  mongoose.model<TeamDocument>("Team", TeamSchema);
