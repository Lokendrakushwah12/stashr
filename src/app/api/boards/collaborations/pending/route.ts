import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const models = await registerModels();

    // Fetch all pending board collaborations for this user's email
    const collaborations = await models.BoardCollaboration.find({
      userEmail: session.user.email.toLowerCase(),
      status: 'pending',
    }).sort({ createdAt: -1 });

    // Fetch board details for each collaboration
    const collaborationsWithBoards = await Promise.all(
      collaborations.map(async (collab) => {
        const collabObject = collab.toObject ? collab.toObject() : collab;
        const board = await models.Board.findById(collabObject.boardId);
        
        if (board) {
          const boardObject = board.toObject ? board.toObject() : board;
          return {
            ...collabObject,
            board: boardObject,
          };
        }
        
        return collabObject;
      })
    );

    return NextResponse.json({ invitations: collaborationsWithBoards });
  } catch (error) {
    console.error('Error fetching pending board collaborations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

