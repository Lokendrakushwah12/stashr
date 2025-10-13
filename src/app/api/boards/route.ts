import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') ?? 'recent';
    const role = searchParams.get('role') ?? 'all';

    await connectDB();
    const models = await registerModels();

    // Determine sort order
    let sortOrder: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sortBy) {
      case 'recent':
        sortOrder = { updatedAt: -1 };
        break;
      case 'oldest':
        sortOrder = { createdAt: 1 };
        break;
      case 'name':
        sortOrder = { name: 1 };
        break;
      default:
        sortOrder = { updatedAt: -1 };
    }

    // Get boards owned by the user
    const ownedBoards = await models.Board.find({ userId: session.user.id })
      .select('_id name description userId linkedFolderId cardCount createdAt updatedAt')
      .sort(sortOrder);

    // Get boards where user is a collaborator (accepted invitations)
    const collaborations = await models.BoardCollaboration.find({
      userId: session.user.id,
      status: 'accepted',
    });

    const collaboratedBoardIds = collaborations.map(c => c.boardId);
    const collaboratedBoards = await models.Board.find({
      _id: { $in: collaboratedBoardIds },
    }).select('_id name description userId linkedFolderId cardCount createdAt updatedAt')
      .sort(sortOrder);

    // Combine both lists
    const allBoards = [...ownedBoards, ...collaboratedBoards];

    // Add card count and userRole for each board
    let boardsWithDetails = await Promise.all(
      allBoards.map(async (board) => {
        const boardObject = board.toObject ? board.toObject() : board;
        const boardId = boardObject._id?.toString() ?? String(boardObject._id);
        const cardCount = await models.BoardCard.countDocuments({ boardId });
        
        // Determine user role
        const isOwner = boardObject.userId === session.user.id;
        const collaboration = collaborations.find(c => c.boardId === boardId);
        const userRole = isOwner ? 'owner' : (collaboration?.role ?? 'viewer');
        
        return {
          ...boardObject,
          cardCount,
          userRole,
        };
      })
    );

    // Filter by role if specified
    if (role !== 'all') {
      boardsWithDetails = boardsWithDetails.filter(board => board.userRole === role);
    }

    // Sort by card count if requested (can't do in MongoDB query since it's computed)
    if (sortBy === 'cards') {
      boardsWithDetails.sort((a, b) => (b.cardCount ?? 0) - (a.cardCount ?? 0));
    }

    return NextResponse.json({ boards: boardsWithDetails });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Board name is required' }, { status: 400 });
    }

    await connectDB();
    const { Board } = await registerModels();
    
    const board = new Board({
      name: name.trim(),
      description: description?.trim() || undefined,
      userId: session.user.id,
      cardCount: 0,
      userRole: 'owner',
    });

    const savedBoard = await board.save();
    const boardObject = savedBoard.toObject ? savedBoard.toObject() : savedBoard;

    return NextResponse.json({ board: boardObject }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
