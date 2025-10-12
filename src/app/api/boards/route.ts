import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const models = await registerModels();

    // Get boards owned by the user
    const ownedBoards = await models.Board.find({ userId: session.user.id })
      .select('_id name description color userId linkedFolderId cardCount createdAt updatedAt')
      .sort({ createdAt: -1 });

    // Get boards where user is a collaborator (accepted invitations)
    const collaborations = await models.BoardCollaboration.find({
      userId: session.user.id,
      status: 'accepted',
    });

    const collaboratedBoardIds = collaborations.map(c => c.boardId);
    const collaboratedBoards = await models.Board.find({
      _id: { $in: collaboratedBoardIds },
    }).select('_id name description color userId linkedFolderId cardCount createdAt updatedAt');

    // Combine both lists
    const allBoards = [...ownedBoards, ...collaboratedBoards];

    // Add card count and userRole for each board
    const boardsWithDetails = await Promise.all(
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
    const { name, description, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Board name is required' }, { status: 400 });
    }

    await connectDB();
    const { Board } = await registerModels();
    
    const board = new Board({
      name: name.trim(),
      description: description?.trim() || undefined,
      color: color || '#3b82f6',
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
