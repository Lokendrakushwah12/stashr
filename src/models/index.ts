import type {
  BookmarkDocument,
  FolderDocument,
  FolderCollaborationDocument,
  BoardDocument,
  BoardCardDocument,
  BoardCollaborationDocument,
  BoardTimelineEntryDocument,
} from "@/types/database";
import type { TeamDocument } from "@/models/Team";
import type { TeamMemberDocument } from "@/models/TeamMember";
import connectDB from "@/lib/mongodb";
import type { Model } from "mongoose";
import mongoose from "mongoose";

// Loads every schema, then returns the models bound to this request's connection.
export async function registerModels() {
  const conn = await connectDB();
  // Dynamically import models to ensure their schemas are registered
  await Promise.all([
    import("@/models/Team"),
    import("@/models/TeamMember"),
    import("@/models/Folder"),
    import("@/models/Bookmark"),
    import("@/models/FolderCollaboration"),
    import("@/models/Board"),
    import("@/models/BoardCard"),
    import("@/models/BoardCollaboration"),
    import("@/models/BoardTimelineEntry"),
  ]);

  // All are bound so populate() can resolve refs by name on this connection.
  const bind = (name: string) =>
    conn.models[name] ?? conn.model(name, mongoose.models[name]!.schema);

  return {
    Team: bind("Team") as Model<TeamDocument>,
    TeamMember: bind("TeamMember") as Model<TeamMemberDocument>,
    Folder: bind("Folder") as Model<FolderDocument>,
    Bookmark: bind("Bookmark") as Model<BookmarkDocument>,
    FolderCollaboration: bind(
      "FolderCollaboration",
    ) as Model<FolderCollaborationDocument>,
    Board: bind("Board") as Model<BoardDocument>,
    BoardCard: bind("BoardCard") as Model<BoardCardDocument>,
    BoardCollaboration: bind(
      "BoardCollaboration",
    ) as Model<BoardCollaborationDocument>,
    BoardTimelineEntry: bind(
      "BoardTimelineEntry",
    ) as Model<BoardTimelineEntryDocument>,
  };
}
