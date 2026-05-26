import { getRequestContext } from "@/lib/api-team";
import { extractImageUrl } from "@/lib/meta-image-extractor";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import type { BookmarkDocument } from "@/types/database";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function canMutateBookmark(opts: {
  bookmarkId: string;
  userId: string;
  userEmail: string;
  teamId: string;
  teamRole: "owner" | "admin" | "editor" | "viewer";
}) {
  const { Bookmark, FolderCollaboration } = await registerModels();
  const bookmark = await Bookmark.findById(opts.bookmarkId).exec();
  if (!bookmark) return { bookmark: null, canEdit: false };

  // Same team
  if (bookmark.teamId && String(bookmark.teamId) === opts.teamId) {
    return { bookmark, canEdit: canWrite(opts.teamRole) };
  }

  // Legacy: original owner
  if (bookmark.userId === opts.userId) {
    return { bookmark, canEdit: true };
  }

  // External collaboration on parent folder
  const collaboration = await FolderCollaboration.findOne({
    folderId: bookmark.folderId,
    $or: [{ userId: opts.userId }, { email: opts.userEmail }],
    status: "accepted",
    role: "editor",
  }).exec();
  if (collaboration) return { bookmark, canEdit: true };

  return { bookmark, canEdit: false };
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
      return NextResponse.json(
        { error: "Invalid bookmark ID" },
        { status: 400 },
      );
    }

    await connectDB();
    const { Bookmark } = await registerModels();

    const body = (await request.json()) as {
      title?: string;
      url?: string;
      description?: string;
    };
    const { title, url, description } = body;

    if (title !== undefined && !title.trim()) {
      return NextResponse.json(
        { error: "Bookmark title cannot be empty" },
        { status: 400 },
      );
    }
    if (url) {
      try {
        new URL(url.trim());
      } catch {
        return NextResponse.json(
          { error: "Please provide a valid URL" },
          { status: 400 },
        );
      }
    }

    const { bookmark, canEdit } = await canMutateBookmark({
      bookmarkId: id,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
    }
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Partial<
      Pick<
        BookmarkDocument,
        "title" | "url" | "description" | "favicon" | "metaImage"
      >
    > = {};
    if (title) updateData.title = title.trim();
    if (url) updateData.url = url.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || "";
    if (url) {
      try {
        const urlObj = new URL(url.trim());
        updateData.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
        const metaImage = await extractImageUrl(url.trim());
        updateData.metaImage = metaImage;
      } catch (error) {
        console.error("Meta image extraction failed:", error);
      }
    }

    const updated = await Bookmark.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
    return NextResponse.json(
      { bookmark: updated?.toObject() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
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
      return NextResponse.json(
        { error: "Invalid bookmark ID" },
        { status: 400 },
      );
    }

    await connectDB();
    const { Bookmark, Folder } = await registerModels();

    const { bookmark, canEdit } = await canMutateBookmark({
      bookmarkId: id,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
    }
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Folder.findByIdAndUpdate(bookmark.folderId, {
      $pull: { bookmarks: bookmark._id },
    }).exec();
    await Bookmark.findByIdAndDelete(id).exec();

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 },
    );
  }
}
