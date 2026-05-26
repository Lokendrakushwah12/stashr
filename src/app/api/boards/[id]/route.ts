import { getRequestContext } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type BoardRole = "owner" | "editor" | "viewer";

async function loadAccessibleBoard(opts: {
  boardId: string;
  userId: string;
  teamId: string;
  teamRole: "owner" | "admin" | "editor" | "viewer";
}) {
  const models = await registerModels();
  const board = await models.Board.findById(opts.boardId);
  if (!board) return { board: null, userRole: null as BoardRole | null };

  // Same team
  if (board.teamId && String(board.teamId) === opts.teamId) {
    const userRole: BoardRole =
      opts.teamRole === "owner" || opts.teamRole === "admin"
        ? "owner"
        : opts.teamRole === "editor"
          ? "editor"
          : "viewer";
    return { board, userRole };
  }

  // Legacy ownership
  if (board.userId === opts.userId) {
    return { board, userRole: "owner" as BoardRole };
  }

  // Per-board collaboration (external)
  const collaboration = await models.BoardCollaboration.findOne({
    boardId: opts.boardId,
    userId: opts.userId,
    status: "accepted",
  });
  if (collaboration) {
    return { board, userRole: (collaboration.role ?? "viewer") as BoardRole };
  }

  return { board: null, userRole: null };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid board ID" }, { status: 400 });
    }

    await connectDB();
    const models = await registerModels();
    const { board, userRole } = await loadAccessibleBoard({
      boardId: id,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const cards = await models.BoardCard.find({ boardId: id });
    const cardsWithLinkedFolders = await Promise.all(
      cards.map(async (card) => {
        const cardObject = card.toObject ? card.toObject() : card;
        if (cardObject.linkedFolderId) {
          const linkedFolder = await models.Folder.findOne({
            _id: cardObject.linkedFolderId,
          });
          if (linkedFolder) {
            const folderObject = linkedFolder.toObject
              ? linkedFolder.toObject()
              : linkedFolder;
            return {
              ...cardObject,
              linkedFolder: {
                id: folderObject._id?.toString() ?? String(folderObject._id),
                name: folderObject.name,
                color: folderObject.color ?? "#3b82f6",
              },
            };
          }
        }
        return cardObject;
      }),
    );

    const boardObject = board.toObject ? board.toObject() : board;
    let linkedFolder = null;
    if (boardObject.linkedFolderId) {
      const folder = await models.Folder.findById(boardObject.linkedFolderId);
      if (folder) {
        const folderObject = folder.toObject ? folder.toObject() : folder;
        linkedFolder = {
          id: folderObject._id?.toString() ?? String(folderObject._id),
          name: folderObject.name,
          color: folderObject.color ?? "#3b82f6",
        };
      }
    }

    return NextResponse.json({
      board: {
        ...boardObject,
        cards: cardsWithLinkedFolders,
        cardCount: cardsWithLinkedFolders.length,
        userRole,
        linkedFolder,
      },
    });
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const body = await request.json();
    const { name, description, content, linkedFolderId } = body;
    const { id } = await params;

    await connectDB();
    const models = await registerModels();
    const { board, userRole } = await loadAccessibleBoard({
      boardId: id,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    const canEdit = userRole === "owner" || userRole === "editor";
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Board name is required" },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined)
      updateData.description = description?.trim() || undefined;
    if (content !== undefined)
      updateData.content = content?.trim() || undefined;
    if (linkedFolderId !== undefined) {
      if (linkedFolderId === null || linkedFolderId === "") {
        updateData.linkedFolderId = null;
      } else if (typeof linkedFolderId === "string") {
        const folder = await models.Folder.findById(linkedFolderId);
        if (!folder) {
          return NextResponse.json(
            { error: "Folder not found" },
            { status: 404 },
          );
        }
        updateData.linkedFolderId = linkedFolderId;
      }
    }

    const updatedBoard = await models.Board.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    const boardObject = updatedBoard?.toObject
      ? updatedBoard.toObject()
      : updatedBoard;
    let linkedFolder = null;
    if (boardObject?.linkedFolderId) {
      const folder = await models.Folder.findById(boardObject.linkedFolderId);
      if (folder) {
        const folderObject = folder.toObject ? folder.toObject() : folder;
        linkedFolder = {
          id: folderObject._id?.toString() ?? String(folderObject._id),
          name: folderObject.name,
          color: folderObject.color ?? "#3b82f6",
        };
      }
    }
    return NextResponse.json({ board: { ...boardObject, linkedFolder } });
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { id } = await params;
    await connectDB();
    const models = await registerModels();
    const { board, userRole } = await loadAccessibleBoard({
      boardId: id,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    if (
      userRole !== "owner" &&
      !(userRole === "editor" && canWrite(ctx.role))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await models.BoardCard.deleteMany({ boardId: id });
    await models.Board.findByIdAndDelete(id);
    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
