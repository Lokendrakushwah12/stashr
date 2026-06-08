import { getRequestContext } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type AccessRole = "owner" | "editor" | "viewer";

async function loadAccessibleBoard(opts: {
  boardId: string;
  userId: string;
  teamId: string;
  teamRole: "owner" | "admin" | "editor" | "viewer";
}): Promise<{
  board: Awaited<ReturnType<typeof loadBoard>>;
  role: AccessRole | null;
}> {
  const { Board, BoardCollaboration } = await registerModels();
  const board = await Board.findById(opts.boardId);
  if (!board) return { board: null, role: null };

  if (board.teamId && String(board.teamId) === opts.teamId) {
    const role: AccessRole =
      opts.teamRole === "owner" || opts.teamRole === "admin"
        ? "owner"
        : opts.teamRole === "editor"
          ? "editor"
          : "viewer";
    return { board, role };
  }
  if (board.userId === opts.userId) return { board, role: "owner" };

  const collab = await BoardCollaboration.findOne({
    boardId: opts.boardId,
    userId: opts.userId,
    status: "accepted",
  });
  if (collab) return { board, role: (collab.role ?? "viewer") as AccessRole };

  return { board: null, role: null };
}

// Helper to give the return type of Board.findById a name
async function loadBoard(boardId: string) {
  const { Board } = await registerModels();
  return Board.findById(boardId);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    await connectDB();
    const models = await registerModels();
    const { id: boardId } = await params;

    const { board, role } = await loadAccessibleBoard({
      boardId,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!board || !role) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const entries = await models.BoardTimelineEntry.find({ boardId }).sort({
      createdAt: 1,
    });

    const entriesWithUserData = await Promise.all(
      entries.map(async (entry) => {
        const entryObject = entry.toObject ? entry.toObject() : entry;
        const user = await mongoose.connection.collection("users").findOne({
          _id: new mongoose.Types.ObjectId(entryObject.userId as string),
        });
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
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const body = await request.json();
    const { content, action, images } = body;
    const { id: boardId } = await params;

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

    const { board, role } = await loadAccessibleBoard({
      boardId,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!board || !role) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    const isTeamBoard = board.teamId && String(board.teamId) === ctx.teamId;
    const canEdit = isTeamBoard
      ? canWrite(ctx.role)
      : role === "owner" || role === "editor";
    if (!canEdit) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const imagesArray = Array.isArray(images) ? images : [];

    // Bump parent board's updatedAt so "last edited" reflects the change.
    await models.Board.updateOne(
      { _id: boardId },
      { $set: { updatedAt: new Date() } },
    );

    const timelineEntry = await models.BoardTimelineEntry.create({
      boardId,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      userName: ctx.userName ?? ctx.userEmail ?? "Unknown",
      userImage: ctx.userImage,
      userRole: role,
      content: content.trim(),
      action: (action ?? "created") as "created" | "updated" | "commented",
      images: imagesArray,
    } as Parameters<typeof models.BoardTimelineEntry.create>[0]);

    const entryObject = timelineEntry.toObject
      ? timelineEntry.toObject()
      : timelineEntry;
    const entryObj = entryObject as unknown as Record<string, unknown>;

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
