import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const models = await registerModels();
    const resolvedParams = await params;
    const boardId = resolvedParams.id;

    // Check if user has access to this board
    const board = await models.Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = board.userId === session.user.id;
    const collaboration = await models.BoardCollaboration.findOne({
      boardId,
      userId: session.user.id,
      status: "accepted",
    });

    if (!isOwner && !collaboration) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch all timeline entries for this board, sorted by creation date
    const entries = await models.BoardTimelineEntry.find({ boardId }).sort({
      createdAt: 1,
    });

    // Convert to plain objects and fetch latest user data
    const entriesWithUserData = await Promise.all(
      entries.map(async (entry) => {
        const entryObject = entry.toObject ? entry.toObject() : entry;

        // Fetch latest user data from users collection
        const user = await mongoose.connection.collection("users").findOne({
          _id: new mongoose.Types.ObjectId(entryObject.userId as string),
        });

        // Ensure images array is always included, even if undefined
        // Type assertion needed because toObject() returns a plain object
        const entryObj = entryObject as unknown as Record<string, unknown>;
        const entryDoc = entry as { images?: string[] };
        const images =
          (entryObj.images as string[] | undefined) ?? entryDoc.images ?? [];

        return {
          ...entryObject,
          userName: user?.name ?? entryObject.userName,
          userImage: user?.image ?? entryObject.userImage,
          images: Array.isArray(images) ? images : [],
        };
      }),
    );

    return NextResponse.json({ entries: entriesWithUserData });
  } catch (error) {
    console.error("Error fetching timeline entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, action, images } = body;
    const resolvedParams = await params;
    const boardId = resolvedParams.id;

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const models = await registerModels();

    // Check if board exists
    const board = await models.Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Check if user has edit access
    const isOwner = board.userId === session.user.id;
    const collaboration = await models.BoardCollaboration.findOne({
      boardId,
      userId: session.user.id,
      status: "accepted",
    });

    const userRole = isOwner ? "owner" : (collaboration?.role ?? "viewer");
    const canEdit = userRole === "owner" || userRole === "editor";

    if (!canEdit) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Create timeline entry
    const imagesArray = Array.isArray(images) ? images : [];

    const timelineEntry = await models.BoardTimelineEntry.create({
      boardId,
      userId: session.user.id,
      userEmail: session.user.email ?? "",
      userName: session.user.name ?? session.user.email ?? "Unknown",
      userImage: session.user.image,
      userRole,
      content: content.trim(),
      action: (action ?? "created") as "created" | "updated" | "commented",
      images: imagesArray,
    } as Parameters<typeof models.BoardTimelineEntry.create>[0]);

    const entryObject = timelineEntry.toObject
      ? timelineEntry.toObject()
      : timelineEntry;
    const entryObj = entryObject as unknown as Record<string, unknown>;

    // Ensure images is always included in response
    return NextResponse.json(
      {
        entry: {
          ...entryObject,
          images: (entryObj.images as string[] | undefined) ?? [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
