import { getRequestContext } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import type { FolderDocument } from "@/types/database";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function loadAccessibleFolder(opts: {
  folderId: string;
  userId: string;
  userEmail: string;
  teamId: string;
}) {
  const { Folder, FolderCollaboration, Board, BoardCollaboration } =
    await registerModels();

  const folder = await Folder.findById(opts.folderId);
  if (!folder) return { folder: null, role: null };

  const teamObjectId = new mongoose.Types.ObjectId(opts.teamId);
  if (folder.teamId && String(folder.teamId) === String(teamObjectId)) {
    return { folder, role: "team" as const };
  }

  // Owner fallback (untagged legacy data)
  if (folder.userId === opts.userId && !folder.teamId) {
    return { folder, role: "owner" as const };
  }

  // External per-folder collaboration
  const collaboration = await FolderCollaboration.findOne({
    folderId: opts.folderId,
    $or: [{ userId: opts.userId }, { email: opts.userEmail }],
    status: "accepted",
  }).exec();
  if (collaboration) {
    return { folder, role: collaboration.role };
  }

  // Folder linked to a board the user has access to
  const linkedBoard = await Board.findOne({ linkedFolderId: opts.folderId });
  if (linkedBoard) {
    if (linkedBoard.userId === opts.userId) {
      return { folder, role: "viewer" as const };
    }
    if (
      linkedBoard.teamId &&
      String(linkedBoard.teamId) === String(teamObjectId)
    ) {
      return { folder, role: "viewer" as const };
    }
    const boardCollaboration = await BoardCollaboration.findOne({
      boardId: linkedBoard._id?.toString(),
      userId: opts.userId,
      status: "accepted",
    });
    if (boardCollaboration) return { folder, role: "viewer" as const };
  }

  return { folder: null, role: null };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    await connectDB();
    const { folder, role } = await loadAccessibleFolder({
      folderId: id,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      teamId: ctx.teamId,
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const userRole =
      role === "team"
        ? ctx.role === "owner" || ctx.role === "admin"
          ? "owner"
          : ctx.role === "editor"
            ? "editor"
            : "viewer"
        : role === "owner"
          ? "owner"
          : role;

    const populated = await folder.populate("bookmarks");
    return NextResponse.json(
      { folder: { ...populated.toObject(), userRole } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    await connectDB();
    const { Folder } = await registerModels();
    const { folder, role } = await loadAccessibleFolder({
      folderId: id,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      teamId: ctx.teamId,
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const isTeamFolder = role === "team";
    const canEdit = isTeamFolder
      ? canWrite(ctx.role)
      : role === "owner" || role === "editor";
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      color?: string;
    };
    const { name, description, color } = body;
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Folder name cannot be empty" },
        { status: 400 },
      );
    }
    if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return NextResponse.json(
        { error: "Please provide a valid hex color code" },
        { status: 400 },
      );
    }

    if (name && folder.teamId) {
      const dupe = await Folder.findOne({
        teamId: folder.teamId,
        name: name.trim(),
        _id: { $ne: id },
      }).exec();
      if (dupe) {
        return NextResponse.json(
          { error: "A folder with this name already exists in this team" },
          { status: 409 },
        );
      }
    }

    const updateData: Partial<FolderDocument> = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() ?? "";
    if (color) updateData.color = color;

    const updated = await Folder.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("bookmarks")
      .exec();

    return NextResponse.json({ folder: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 },
      );
    }
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    await connectDB();
    const { Folder, Bookmark, FolderCollaboration } = await registerModels();
    const { folder, role } = await loadAccessibleFolder({
      folderId: id,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      teamId: ctx.teamId,
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    const canDelete =
      (role === "team" &&
        (ctx.role === "owner" ||
          ctx.role === "admin" ||
          ctx.role === "editor")) ||
      role === "owner";
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (folder.bookmarks?.length) {
      await Bookmark.deleteMany({ _id: { $in: folder.bookmarks } }).exec();
    }
    await FolderCollaboration.deleteMany({ folderId: id }).exec();
    await Folder.findByIdAndDelete(id).exec();

    return NextResponse.json(
      { message: "Folder and its bookmarks deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 },
    );
  }
}
