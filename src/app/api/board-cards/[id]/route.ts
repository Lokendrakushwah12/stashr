import { getRequestContext } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function canMutateCard(opts: {
  cardId: string;
  userId: string;
  teamId: string;
  teamRole: "owner" | "admin" | "editor" | "viewer";
}) {
  const { BoardCard, Board, BoardCollaboration } = await registerModels();
  const card = await BoardCard.findById(opts.cardId);
  if (!card) return { card: null, canEdit: false };

  if (card.teamId && String(card.teamId) === opts.teamId) {
    return { card, canEdit: canWrite(opts.teamRole) };
  }
  if (card.userId === opts.userId) {
    return { card, canEdit: true };
  }
  const board = await Board.findById(card.boardId);
  if (board) {
    if (board.teamId && String(board.teamId) === opts.teamId) {
      return { card, canEdit: canWrite(opts.teamRole) };
    }
    const collab = await BoardCollaboration.findOne({
      boardId: card.boardId,
      userId: opts.userId,
      status: "accepted",
      role: { $in: ["owner", "editor"] },
    });
    if (collab) return { card, canEdit: true };
  }
  return { card, canEdit: false };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const body = await request.json();
    const { title, description, status, priority, linkedFolderId } = body;
    const { id: cardId } = await params;

    await connectDB();
    const models = await registerModels();
    const { card, canEdit } = await canMutateCard({
      cardId,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Card title is required" },
          { status: 400 },
        );
      }
      updateData.title = title.trim();
    }
    if (description !== undefined)
      updateData.description = description?.trim() || undefined;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (linkedFolderId !== undefined)
      updateData.linkedFolderId = linkedFolderId || undefined;

    const updatedCard = await models.BoardCard.findByIdAndUpdate(
      cardId,
      { $set: updateData },
      { new: true },
    );
    const cardObject = updatedCard?.toObject
      ? updatedCard.toObject()
      : updatedCard;

    if (updatedCard?.linkedFolderId) {
      const linkedFolder = await models.Folder.findOne({
        _id: updatedCard.linkedFolderId,
      });
      if (linkedFolder) {
        const folderObject = linkedFolder.toObject
          ? linkedFolder.toObject()
          : linkedFolder;
        return NextResponse.json({
          card: {
            ...cardObject,
            linkedFolder: {
              id: folderObject._id?.toString() ?? String(folderObject._id),
              name: folderObject.name,
              color: folderObject.color ?? "#3b82f6",
            },
          },
        });
      }
    }
    return NextResponse.json({ card: cardObject });
  } catch (error) {
    console.error("Error updating board card:", error);
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

    const { id: cardId } = await params;
    await connectDB();
    const models = await registerModels();
    const { card, canEdit } = await canMutateCard({
      cardId,
      userId: ctx.userId,
      teamId: ctx.teamId,
      teamRole: ctx.role,
    });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await models.BoardCard.findByIdAndDelete(cardId);
    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting board card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
