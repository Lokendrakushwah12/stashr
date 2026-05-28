import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import type { CreateBookmarkRequest } from "@/types";
import { registerModels } from "@/models";
import { extractImageUrl } from "@/lib/meta-image-extractor";
import { getRequestContext, planLimitResponse } from "@/lib/api-team";
import { assertWithinLimit, PlanLimitError } from "@/lib/plans";
import { canWrite } from "@/lib/team-service";

// POST /api/bookmarks - Create a bookmark inside a folder owned by the current team
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;
    if (!canWrite(ctx.role)) {
      return NextResponse.json(
        { error: "You don't have permission to add bookmarks in this team" },
        { status: 403 },
      );
    }

    await connectDB();
    const { Bookmark, Folder, FolderCollaboration, Team } =
      await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);

    const body = (await request.json()) as CreateBookmarkRequest;
    const { title, url, description, folderId } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Bookmark title is required" },
        { status: 400 },
      );
    }
    if (!url?.trim()) {
      return NextResponse.json(
        { error: "Bookmark URL is required" },
        { status: 400 },
      );
    }
    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: "Valid folder ID is required" },
        { status: 400 },
      );
    }

    try {
      new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 },
      );
    }

    const folder = await Folder.findById(folderId).exec();
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const isTeamFolder = folder.teamId && String(folder.teamId) === ctx.teamId;
    if (!isTeamFolder) {
      // Cross-team via per-folder collaboration (legacy)
      const collaboration = await FolderCollaboration.findOne({
        folderId,
        userId: ctx.userId,
        status: "accepted",
        role: "editor",
      }).exec();
      if (!collaboration) {
        return NextResponse.json(
          {
            error: "You do not have permission to add bookmarks to this folder",
          },
          { status: 403 },
        );
      }
    }

    // Plan limit: bookmarksPerFolder
    const team = await Team.findById(teamObjectId).lean();
    const planId = team?.planId ?? "free";
    const bookmarkCountInFolder = await Bookmark.countDocuments({
      folderId: new mongoose.Types.ObjectId(folderId),
    });
    try {
      assertWithinLimit({
        planId,
        key: "bookmarksPerFolder",
        current: bookmarkCountInFolder,
      });
    } catch (e) {
      if (e instanceof PlanLimitError) return planLimitResponse(e);
      throw e;
    }

    const normalizedUrl = url.trim().replace(/\/$/, "");

    let existingBookmark = await Bookmark.findOne({
      url: normalizedUrl,
      teamId: teamObjectId,
    }).exec();
    if (!existingBookmark) {
      const urlVariations = [
        normalizedUrl,
        normalizedUrl + "/",
        normalizedUrl.replace(/^https?:\/\//, "http://"),
        normalizedUrl.replace(/^https?:\/\//, "https://"),
      ];
      existingBookmark = await Bookmark.findOne({
        url: { $in: urlVariations },
        teamId: teamObjectId,
      }).exec();
    }
    if (existingBookmark) {
      return NextResponse.json(
        { error: "A bookmark with this URL already exists in this team" },
        { status: 409 },
      );
    }

    let favicon = "";
    try {
      const urlObj = new URL(normalizedUrl);
      favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      /* validator catches */
    }

    let metaImage = "";
    try {
      metaImage = await extractImageUrl(normalizedUrl);
    } catch (error) {
      console.error("Meta image extraction failed:", error);
    }

    const bookmark = new Bookmark({
      title: title.trim(),
      url: normalizedUrl,
      description: description?.trim() ?? "",
      favicon,
      metaImage,
      userId: ctx.userId,
      teamId: isTeamFolder ? teamObjectId : folder.teamId,
      folderId,
    });

    try {
      await bookmark.save();
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return NextResponse.json(
          { error: "A bookmark with this URL already exists" },
          { status: 409 },
        );
      }
      throw error;
    }

    folder.bookmarks.push(bookmark._id as mongoose.Types.ObjectId);
    await folder.save();
    await bookmark.populate("folderId");

    return NextResponse.json(
      { bookmark: bookmark.toObject() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 },
    );
  }
}
