import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// POST /api/bookmarks/bulk/import - Bulk import bookmarks
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const { Bookmark, Folder } = await registerModels();

    // Get or create folder for imports
    const folderNameToUse = folderName?.trim() ?? "Imported Bookmarks";
    let defaultFolder = await Folder.findOne({
      userId: session.user.id,
      name: folderNameToUse,
    });

    if (!defaultFolder) {
      defaultFolder = await Folder.create({
        userId: session.user.id,
        name: folderNameToUse,
        description: `Bookmarks imported from ${source ?? "external source"}`,
        color: "#3B82F6", // Default blue color
        bookmarks: [],
      });
    }

    const importedBookmarks: Array<Record<string, unknown>> = [];
    const errors: Array<{ url: string; error: string }> = [];

    for (const bookmarkData of bookmarks) {
      try {
        // Type guard for bookmark data
        if (!bookmarkData || typeof bookmarkData !== "object") {
          errors.push({
            url: "unknown",
            error: "Invalid bookmark data format",
          });
          continue;
        }

        const data = bookmarkData as Record<string, unknown>;

        // Validate required fields
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

        // Check if bookmark already exists
        // Normalize URL by removing trailing slashes
        const normalizedUrl = data.url.replace(/\/$/, "");

        // Check for exact match first
        let existingBookmark = await Bookmark.findOne({
          userId: session.user.id,
          url: normalizedUrl,
        });

        // If no exact match, check for variations (with/without trailing slash, different protocols)
        if (!existingBookmark) {
          const urlVariations = [
            normalizedUrl,
            normalizedUrl + "/",
            normalizedUrl.replace(/^https?:\/\//, "http://"),
            normalizedUrl.replace(/^https?:\/\//, "https://"),
          ];

          existingBookmark = await Bookmark.findOne({
            url: { $in: urlVariations },
            userId: session.user.id,
          });
        }

        if (existingBookmark) {
          errors.push({
            url: data.url,
            error: "Bookmark already exists",
          });
          continue;
        }

        // Create new bookmark
        let bookmark;
        try {
          bookmark = await Bookmark.create({
            userId: session.user.id,
            title: data.title,
            url: normalizedUrl,
            description: (data.description ?? data.excerpt ?? "") as string,
            folderId: (data.folderId as string) ?? defaultFolder._id,
            tags: (data.tags as string[]) ?? [],
            createdAt: data.createdAt
              ? new Date(data.createdAt as string)
              : new Date(),
            updatedAt: new Date(),
          } as Parameters<typeof Bookmark.create>[0]);
        } catch (error) {
          // Check if it's a duplicate key error
          if (
            error instanceof Error &&
            error.message.includes("duplicate key")
          ) {
            errors.push({
              url: data.url,
              error: "Bookmark already exists",
            });
            continue;
          }
          throw error; // Re-throw other errors
        }

        // Add bookmark to folder
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

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to import bookmarks: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to import bookmarks" },
      { status: 500 },
    );
  }
}

// GET /api/bookmarks/bulk/export - Export all bookmarks
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "json";
    const folderId = searchParams.get("folderId");

    await connectDB();
    const { Bookmark } = await registerModels();

    let query: { userId: string; folderId?: string } = {
      userId: session.user.id,
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
      const htmlContent = generateHTMLExport(
        bookmarks as unknown as Array<Record<string, unknown>>,
      );
      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": 'attachment; filename="bookmarks.html"',
        },
      });
    }

    if (format === "csv") {
      const csvContent = generateCSVExport(
        bookmarks as unknown as Array<Record<string, unknown>>,
      );
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="bookmarks.csv"',
        },
      });
    }

    // Default JSON export
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

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to export bookmarks: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to export bookmarks" },
      { status: 500 },
    );
  }
}

function generateHTMLExport(bookmarks: Array<Record<string, unknown>>): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bookmarks Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .bookmark { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    .title { font-weight: bold; color: #333; }
    .url { color: #0066cc; text-decoration: none; }
    .url:hover { text-decoration: underline; }
    .description { color: #666; margin: 5px 0; }
    .folder { color: #888; font-size: 0.9em; }
    .tags { color: #888; font-size: 0.9em; }
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
      ${b.tags && Array.isArray(b.tags) && b.tags.length > 0 ? `<div class="tags">Tags: ${b.tags.join(", ")}</div>` : ""}
    </div>
  `,
    )
    .join("")}
</body>
</html>`;

  return html;
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
