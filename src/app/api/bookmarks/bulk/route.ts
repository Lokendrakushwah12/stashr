import { getRequestContext, planLimitResponse } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { assertWithinLimit, PlanLimitError } from "@/lib/plans";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// POST /api/bookmarks/bulk - Bulk import bookmarks into the current team
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;
    if (!canWrite(ctx.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      bookmarks: unknown[];
      source?: string;
      folderName?: string;
    };
    const { bookmarks, source, folderName } = body;

    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return NextResponse.json(
        { error: "Invalid bookmarks data" },
        { status: 400 },
      );
    }

    await connectDB();
    const { Bookmark, Folder, Team } = await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);
    const team = await Team.findById(teamObjectId).lean();
    const planId = team?.planId ?? "free";

    // Find or create the import folder (team-scoped)
    const folderNameToUse = folderName?.trim() ?? "Imported Bookmarks";
    let defaultFolder = await Folder.findOne({
      teamId: teamObjectId,
      name: folderNameToUse,
    });

    if (!defaultFolder) {
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
      defaultFolder = await Folder.create({
        userId: ctx.userId,
        teamId: teamObjectId,
        name: folderNameToUse,
        description: `Bookmarks imported from ${source ?? "external source"}`,
        color: "#3B82F6",
        bookmarks: [],
      });
    }

    const importedBookmarks: Array<Record<string, unknown>> = [];
    const errors: Array<{ url: string; error: string }> = [];

    for (const bookmarkData of bookmarks) {
      try {
        if (!bookmarkData || typeof bookmarkData !== "object") {
          errors.push({
            url: "unknown",
            error: "Invalid bookmark data format",
          });
          continue;
        }
        const data = bookmarkData as Record<string, unknown>;
        if (
          !data.url ||
          !data.title ||
          typeof data.url !== "string" ||
          typeof data.title !== "string"
        ) {
          errors.push({
            url: (data.url as string) ?? "unknown",
            error: "Missing required fields (url or title)",
          });
          continue;
        }

        const targetFolderId =
          (data.folderId as string | undefined) ?? String(defaultFolder._id);

        // Per-folder limit check
        const folderBookmarkCount = await Bookmark.countDocuments({
          folderId: new mongoose.Types.ObjectId(targetFolderId),
        });
        try {
          assertWithinLimit({
            planId,
            key: "bookmarksPerFolder",
            current: folderBookmarkCount,
          });
        } catch (e) {
          if (e instanceof PlanLimitError) {
            errors.push({ url: data.url, error: "Plan limit reached" });
            continue;
          }
          throw e;
        }

        const normalizedUrl = data.url.replace(/\/$/, "");
        let existingBookmark = await Bookmark.findOne({
          teamId: teamObjectId,
          url: normalizedUrl,
        });
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
          });
        }
        if (existingBookmark) {
          errors.push({ url: data.url, error: "Bookmark already exists" });
          continue;
        }

        let bookmark;
        try {
          bookmark = await Bookmark.create({
            userId: ctx.userId,
            teamId: teamObjectId,
            title: data.title,
            url: normalizedUrl,
            description: (data.description ?? data.excerpt ?? "") as string,
            folderId: targetFolderId,
            tags: (data.tags as string[]) ?? [],
            createdAt: data.createdAt
              ? new Date(data.createdAt as string)
              : new Date(),
            updatedAt: new Date(),
          } as Parameters<typeof Bookmark.create>[0]);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("duplicate key")
          ) {
            errors.push({ url: data.url, error: "Bookmark already exists" });
            continue;
          }
          throw error;
        }

        await Folder.findByIdAndUpdate(bookmark.folderId, {
          $push: { bookmarks: bookmark._id },
        });

        const bookmarkObj = bookmark.toObject ? bookmark.toObject() : bookmark;
        importedBookmarks.push(
          bookmarkObj as unknown as Record<string, unknown>,
        );
      } catch (error) {
        const data = bookmarkData as Record<string, unknown>;
        errors.push({
          url: (data?.url as string) ?? "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        imported: importedBookmarks.length,
        errors: errors.length,
        details: {
          imported: importedBookmarks.map((b) => ({
            id: b._id,
            title: b.title,
            url: b.url,
          })),
          errors,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error importing bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to import bookmarks" },
      { status: 500 },
    );
  }
}

// GET /api/bookmarks/bulk - Export bookmarks in the current team
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "json";
    const folderId = searchParams.get("folderId");

    await connectDB();
    const { Bookmark } = await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);

    let query: { teamId: mongoose.Types.ObjectId; folderId?: string } = {
      teamId: teamObjectId,
    };
    if (folderId) {
      query = { ...query, folderId };
    }

    const bookmarks = await Bookmark.find(query)
      .populate("folderId", "name color")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (format === "html") {
      return new NextResponse(
        generateHTMLExport(
          bookmarks as unknown as Array<Record<string, unknown>>,
        ),
        {
          headers: {
            "Content-Type": "text/html",
            "Content-Disposition": 'attachment; filename="bookmarks.html"',
          },
        },
      );
    }
    if (format === "csv") {
      return new NextResponse(
        generateCSVExport(
          bookmarks as unknown as Array<Record<string, unknown>>,
        ),
        {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="bookmarks.csv"',
          },
        },
      );
    }

    return NextResponse.json({
      success: true,
      count: bookmarks.length,
      bookmarks: bookmarks.map((b) => ({
        id: b._id,
        title: b.title,
        url: b.url,
        description: b.description,
        folder:
          b.folderId && typeof b.folderId === "object" && "name" in b.folderId
            ? {
                name: (b.folderId as Record<string, unknown>).name as string,
                color: (b.folderId as Record<string, unknown>).color as string,
              }
            : null,
        tags: (b as unknown as Record<string, unknown>).tags as string[],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error exporting bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to export bookmarks" },
      { status: 500 },
    );
  }
}

function generateHTMLExport(bookmarks: Array<Record<string, unknown>>): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bookmarks Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .bookmark { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    .title { font-weight: bold; color: #333; }
    .url { color: #0066cc; text-decoration: none; }
    .description { color: #666; margin: 5px 0; }
    .folder { color: #888; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Bookmarks Export</h1>
  <p>Total bookmarks: ${bookmarks.length}</p>
  <p>Exported on: ${new Date().toLocaleString()}</p>
  ${bookmarks
    .map(
      (b) => `
    <div class="bookmark">
      <div class="title">${(b.title as string) ?? "No title"}</div>
      <div><a href="${(b.url as string) ?? "#"}" class="url">${(b.url as string) ?? "No URL"}</a></div>
      ${b.description ? `<div class="description">${b.description as string}</div>` : ""}
      ${b.folderId && typeof b.folderId === "object" && "name" in b.folderId ? `<div class="folder">Folder: ${(b.folderId as Record<string, unknown>).name as string}</div>` : ""}
    </div>
  `,
    )
    .join("")}
</body>
</html>`;
}

function generateCSVExport(bookmarks: Array<Record<string, unknown>>): string {
  const headers = [
    "Title",
    "URL",
    "Description",
    "Folder",
    "Tags",
    "Created Date",
  ];
  const rows = bookmarks.map((b) => [
    `"${((b.title as string) ?? "").replace(/"/g, '""')}"`,
    `"${((b.url as string) ?? "").replace(/"/g, '""')}"`,
    `"${((b.description as string) ?? "").replace(/"/g, '""')}"`,
    `"${b.folderId && typeof b.folderId === "object" && "name" in b.folderId ? ((b.folderId as Record<string, unknown>).name as string) : ""}"`,
    `"${Array.isArray(b.tags) ? b.tags.join(", ") : ""}"`,
    `"${b.createdAt ? new Date(b.createdAt as string).toLocaleDateString() : ""}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
