import { getRequestContext, planLimitResponse } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { assertWithinLimit, PlanLimitError } from "@/lib/plans";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { CreateFolderRequest } from "@/types";

// GET /api/folders - Get all folders in the current team (+ external collaborator folders)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim() ?? "";

    await connectDB();
    const { Folder, FolderCollaboration, Bookmark } = await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);

    const teamFolders = await Folder.find({ teamId: teamObjectId })
      .select(
        "_id name description color userId teamId bookmarks createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Cross-team folders shared via per-folder collaboration (legacy)
    const collabs = await FolderCollaboration.find({
      userId: ctx.userId,
      status: "accepted",
    })
      .select("folderId")
      .lean()
      .exec();
    const collabIds = collabs.map((c) => c.folderId);
    const collabFolders =
      collabIds.length > 0
        ? await Folder.find({
            _id: { $in: collabIds },
            teamId: { $ne: teamObjectId },
          })
            .select(
              "_id name description color userId teamId bookmarks createdAt updatedAt",
            )
            .sort({ createdAt: -1 })
            .lean()
            .exec()
        : [];

    let folders = [...teamFolders, ...collabFolders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const folderIds = folders.map((f) => f._id.toString());
      const matchingBookmarks = await Bookmark.find({
        folderId: { $in: folderIds },
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { url: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .select("folderId")
        .lean()
        .exec();
      const bookmarkFolderIds = new Set(
        matchingBookmarks.map((b) => b.folderId?.toString()).filter(Boolean),
      );
      folders = folders.filter((folder) => {
        const folderNameMatch = folder.name
          ?.toLowerCase()
          .includes(searchLower);
        const hasMatchingBookmarks = bookmarkFolderIds.has(
          folder._id.toString(),
        );
        return folderNameMatch || hasMatchingBookmarks;
      });
    }

    const foldersWithCount = folders.map((folder) => ({
      _id: folder._id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      userId: folder.userId,
      teamId: folder.teamId,
      bookmarkCount: folder.bookmarks?.length ?? 0,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }));

    return NextResponse.json({ folders: foldersWithCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 },
    );
  }
}

// POST /api/folders - Create a new folder in the current team
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;
    if (!canWrite(ctx.role)) {
      return NextResponse.json(
        { error: "You don't have permission to create folders in this team" },
        { status: 403 },
      );
    }

    await connectDB();
    const { Folder, Team } = await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);

    const team = await Team.findById(teamObjectId).lean();
    const planId = team?.planId ?? "free";

    const body = (await request.json()) as CreateFolderRequest;
    const { name, description, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    // Plan limit: foldersPerTeam
    const folderCount = await Folder.countDocuments({ teamId: teamObjectId });
    try {
      assertWithinLimit({
        planId,
        key: "foldersPerTeam",
        current: folderCount,
      });
    } catch (e) {
      if (e instanceof PlanLimitError) return planLimitResponse(e);
      throw e;
    }

    const existingFolder = await Folder.findOne({
      teamId: teamObjectId,
      name: name.trim(),
    }).exec();
    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists in this team" },
        { status: 409 },
      );
    }

    const folder = new Folder({
      name: name.trim(),
      description: description?.trim() ?? "",
      color: color ?? "#3B82F6",
      userId: ctx.userId,
      teamId: teamObjectId,
    });
    await folder.save();

    return NextResponse.json({ folder: folder.toObject() }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
