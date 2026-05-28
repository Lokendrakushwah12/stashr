import { getRequestContext } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function loadAccessibleBoard(opts: {
  boardId: string;
  userId: string;
  teamId: string;
}) {
  const { Board, BoardCollaboration } = await registerModels();
  const board = await Board.findById(opts.boardId);
  if (!board) return { board: null, canRead: false, canWriteCards: false };

  if (board.teamId && String(board.teamId) === opts.teamId) {
    return { board, canRead: true, canWriteCards: true };
  }
  if (board.userId === opts.userId) {
    return { board, canRead: true, canWriteCards: true };
  }
  const collab = await BoardCollaboration.findOne({
    boardId: opts.boardId,
    userId: opts.userId,
    status: "accepted",
  });
  if (collab) {
    return {
      board,
      canRead: true,
      canWriteCards: collab.role === "editor" || collab.role === "owner",
    };
  }
  return { board: null, canRead: false, canWriteCards: false };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;
    const { id } = await params;

    await connectDB();
    const models = await registerModels();
    const { board, canRead } = await loadAccessibleBoard({
      boardId: id,
      userId: ctx.userId,
      teamId: ctx.teamId,
    });
    if (!board || !canRead) {
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

    return NextResponse.json({ cards: cardsWithLinkedFolders });
  } catch (error) {
    console.error("Error fetching board cards:", error);
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
    const { id } = await params;

    const body = await request.json();
    const { title, description, status, priority, linkedFolderId } = body;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Card title is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const models = await registerModels();
    const { board, canWriteCards } = await loadAccessibleBoard({
      boardId: id,
      userId: ctx.userId,
      teamId: ctx.teamId,
    });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    const teamWrite =
      board.teamId && String(board.teamId) === ctx.teamId
        ? canWrite(ctx.role)
        : true;
    if (!canWriteCards || !teamWrite) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const card = {
      title: title.trim(),
      description: description?.trim() || undefined,
      status: status || "todo",
      priority: priority || "medium",
      linkedFolderId: linkedFolderId || undefined,
      boardId: id,
      userId: ctx.userId,
      teamId: board.teamId ?? new mongoose.Types.ObjectId(ctx.teamId),
    };
    const createdCard = await models.BoardCard.create(card);
    const cardObject = createdCard.toObject
      ? createdCard.toObject()
      : createdCard;

    if (createdCard.linkedFolderId) {
      const linkedFolder = await models.Folder.findOne({
        _id: createdCard.linkedFolderId,
      });
      if (linkedFolder) {
        const folderObject = linkedFolder.toObject
          ? linkedFolder.toObject()
          : linkedFolder;
        return NextResponse.json(
          {
            card: {
              ...cardObject,
              linkedFolder: {
                id: folderObject._id?.toString() ?? String(folderObject._id),
                name: folderObject.name,
                color: folderObject.color ?? "#3b82f6",
              },
            },
          },
          { status: 201 },
        );
      }
    }
    return NextResponse.json({ card: cardObject }, { status: 201 });
  } catch (error) {
    console.error("Error creating board card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
