import { authOptions } from "@/lib/auth";
import { registerModels } from "@/models";
import connectDB from "@/lib/mongodb";
import type { CreateFolderRequest } from "@/types";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/folders - Get all folders with their bookmarks for the authenticated user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim() || "";

    await connectDB();
    const { Folder, FolderCollaboration, Bookmark } = await registerModels();

    // Get folders owned by user
    const ownedFolders = await Folder.find({ userId: session.user.id })
      .select("_id name description color userId bookmarks createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Get folders where user is a collaborator
    const collaborations = await FolderCollaboration.find({
      userId: session.user.id,
      status: "accepted",
    })
      .select("folderId")
      .lean()
      .exec();

    const collaborationFolderIds = collaborations.map((c) => c.folderId);

    const collaboratorFolders =
      collaborationFolderIds.length > 0
        ? await Folder.find({ _id: { $in: collaborationFolderIds } })
            .select(
              "_id name description color userId bookmarks createdAt updatedAt",
            )
            .sort({ createdAt: -1 })
            .lean()
            .exec()
        : [];

    // Combine and sort all folders
    const allFolders = [...ownedFolders, ...collaboratorFolders];
    let folders = allFolders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // If search query exists, filter folders and bookmarks
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const folderIds = folders.map((f) => f._id.toString());

      // Search bookmarks by title or URL in accessible folders
      // Note: We don't filter by userId here because bookmarks in collaborator folders
      // might be owned by the folder owner, not the collaborator
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

      // Filter folders by name or if they have matching bookmarks
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

    // Transform folders to include bookmark count instead of full bookmark data
    const foldersWithCount = folders.map((folder) => ({
      _id: folder._id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      userId: folder.userId,
      bookmarkCount: folder.bookmarks?.length || 0,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }));

    return NextResponse.json({ folders: foldersWithCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching folders:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch folders: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 },
    );
  }
}

// POST /api/folders - Create a new folder for the authenticated user
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { Folder } = await registerModels();

    const body = (await request.json()) as CreateFolderRequest;
    const { name, description, color } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    // Check if folder with same name already exists for this user
    const existingFolder = await Folder.findOne({
      userId: session.user.id,
      name: name.trim(),
    }).exec();

    if (existingFolder) {
      return NextResponse.json(
        { error: "A folder with this name already exists" },
        { status: 409 },
      );
    }

    const folder = new Folder({
      name: name.trim(),
      description: description?.trim() ?? "",
      color: color ?? "#3B82F6",
      userId: session.user.id,
    });

    await folder.save();

    return NextResponse.json({ folder: folder.toObject() }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create folder: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
