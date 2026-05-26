import mongoose, { Schema, type Document } from "mongoose";

export interface TeamDocument extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  ownerId: string;
  planId: "free" | "pro";
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
  },
  { timestamps: true },
);

TeamSchema.index({ ownerId: 1, slug: 1 }, { unique: true });

export default (mongoose.models.Team as mongoose.Model<TeamDocument>) ??
  mongoose.model<TeamDocument>("Team", TeamSchema);
