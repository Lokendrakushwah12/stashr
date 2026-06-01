import { getRequestContext } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// PUT /api/folders/[id]/bookmark-order
// Body: { bookmarkIds: string[] } — must be exactly the set of bookmark ids
// already in the folder. Reorders Folder.bookmarks accordingly.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;
    if (!canWrite(ctx.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const body = (await request.json()) as { bookmarkIds?: unknown };
    const { bookmarkIds } = body;
    if (
      !Array.isArray(bookmarkIds) ||
      !bookmarkIds.every(
        (b): b is string =>
          typeof b === "string" && mongoose.Types.ObjectId.isValid(b),
      )
    ) {
      return NextResponse.json(
        { error: "bookmarkIds must be an array of valid ObjectId strings" },
        { status: 400 },
      );
    }

    await connectDB();
    const { Folder } = await registerModels();
    const folder = await Folder.findById(id);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Authorization: team owner/admin/editor on the team that owns the folder,
    // or the legacy owner.
    const sameTeam = folder.teamId && String(folder.teamId) === ctx.teamId;
    const isLegacyOwner = !folder.teamId && folder.userId === ctx.userId;
    if (!sameTeam && !isLegacyOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentIds = (folder.bookmarks ?? []).map((b) => String(b));
    const incoming = bookmarkIds.map(String);
    if (incoming.length !== currentIds.length) {
      return NextResponse.json(
        {
          error: "bookmarkIds length must match the folder's current bookmarks",
        },
        { status: 400 },
      );
    }
    const currentSet = new Set(currentIds);
    if (!incoming.every((b) => currentSet.has(b))) {
      return NextResponse.json(
        { error: "bookmarkIds contain unknown bookmarks for this folder" },
        { status: 400 },
      );
    }

    folder.bookmarks = incoming.map(
      (b) => new mongoose.Types.ObjectId(b),
    ) as typeof folder.bookmarks;
    await folder.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to reorder bookmarks" },
      { status: 500 },
    );
  }
}
