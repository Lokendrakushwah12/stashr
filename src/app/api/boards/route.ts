import { getRequestContext, planLimitResponse } from "@/lib/api-team";
import connectDB from "@/lib/mongodb";
import { assertWithinLimit, PlanLimitError } from "@/lib/plans";
import { canWrite } from "@/lib/team-service";
import { registerModels } from "@/models";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") ?? "recent";
    const role = searchParams.get("role") ?? "all";

    await connectDB();
    const models = await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);

    let sortOrder: Record<string, 1 | -1> = { updatedAt: -1 };
    switch (sortBy) {
      case "recent":
        sortOrder = { updatedAt: -1 };
        break;
      case "oldest":
        sortOrder = { createdAt: 1 };
        break;
      case "name":
        sortOrder = { name: 1 };
        break;
    }

    const teamBoards = await models.Board.find({ teamId: teamObjectId })
      .select(
        "_id name description userId teamId linkedFolderId cardCount createdAt updatedAt",
      )
      .sort(sortOrder);

    // Legacy: boards shared via per-board collaboration outside the current team
    const collaborations = await models.BoardCollaboration.find({
      userId: ctx.userId,
      status: "accepted",
    });
    const collaboratedBoardIds = collaborations.map((c) => c.boardId);
    const collaboratedBoards =
      collaboratedBoardIds.length > 0
        ? await models.Board.find({
            _id: { $in: collaboratedBoardIds },
            $or: [
              { teamId: { $ne: teamObjectId } },
              { teamId: { $exists: false } },
            ],
          })
            .select(
              "_id name description userId teamId linkedFolderId cardCount createdAt updatedAt",
            )
            .sort(sortOrder)
        : [];

    const allBoards = [...teamBoards, ...collaboratedBoards];

    let boardsWithDetails = await Promise.all(
      allBoards.map(async (board) => {
        const boardObject = board.toObject ? board.toObject() : board;
        const boardId = boardObject._id?.toString() ?? String(boardObject._id);
        const cardCount = await models.BoardCard.countDocuments({ boardId });

        const isTeamBoard =
          boardObject.teamId && String(boardObject.teamId) === ctx.teamId;
        let userRole: "owner" | "editor" | "viewer" = "viewer";
        if (isTeamBoard) {
          // Team members all share access; map team role -> board role
          userRole =
            ctx.role === "owner" || ctx.role === "admin"
              ? "owner"
              : ctx.role === "editor"
                ? "editor"
                : "viewer";
        } else if (boardObject.userId === ctx.userId) {
          userRole = "owner";
        } else {
          const collaboration = collaborations.find(
            (c) => c.boardId === boardId,
          );
          userRole = collaboration?.role ?? "viewer";
        }

        return { ...boardObject, cardCount, userRole };
      }),
    );

    if (role !== "all") {
      boardsWithDetails = boardsWithDetails.filter((b) => b.userRole === role);
    }
    if (sortBy === "cards") {
      boardsWithDetails.sort((a, b) => (b.cardCount ?? 0) - (a.cardCount ?? 0));
    }

    return NextResponse.json({ boards: boardsWithDetails });
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext(request);
    if (ctx instanceof NextResponse) return ctx;
    if (!canWrite(ctx.role)) {
      return NextResponse.json(
        { error: "You don't have permission to create boards in this team" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
    };
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Board name is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const { Board, Team } = await registerModels();
    const teamObjectId = new mongoose.Types.ObjectId(ctx.teamId);

    const team = await Team.findById(teamObjectId).lean();
    const planId = team?.planId ?? "free";

    const boardCount = await Board.countDocuments({ teamId: teamObjectId });
    try {
      assertWithinLimit({
        planId,
        key: "boardsPerTeam",
        current: boardCount,
      });
    } catch (e) {
      if (e instanceof PlanLimitError) return planLimitResponse(e);
      throw e;
    }

    const board = new Board({
      name: name.trim(),
      description: description?.trim() || undefined,
      userId: ctx.userId,
      teamId: teamObjectId,
      cardCount: 0,
      userRole: "owner",
    });
    const savedBoard = await board.save();
    const boardObject = savedBoard.toObject
      ? savedBoard.toObject()
      : savedBoard;
    return NextResponse.json({ board: boardObject }, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
