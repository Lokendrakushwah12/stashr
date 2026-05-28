import mongoose, { Schema, type Document } from "mongoose";

export type TeamRole = "owner" | "admin" | "editor" | "viewer";
export type TeamMemberStatus = "pending" | "active" | "declined";

export interface TeamMemberDocument extends Document {
  teamId: mongoose.Types.ObjectId;
  userId?: string;
  email: string;
  name?: string;
  image?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  invitedByUserId?: string;
  invitedByName?: string;
  invitedAt: Date;
  respondedAt?: Date;
  acknowledgedByInviterAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<TeamMemberDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, trim: true },
    image: { type: String, trim: true },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      default: "editor",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "declined"],
      default: "pending",
      required: true,
    },
    invitedByUserId: { type: String },
    invitedByName: { type: String },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    acknowledgedByInviterAt: { type: Date },
  },
  { timestamps: true },
);

TeamMemberSchema.index({ teamId: 1, email: 1 }, { unique: true });
TeamMemberSchema.index({ userId: 1, status: 1 });

export default (mongoose.models
  .TeamMember as mongoose.Model<TeamMemberDocument>) ??
  mongoose.model<TeamMemberDocument>("TeamMember", TeamMemberSchema);
