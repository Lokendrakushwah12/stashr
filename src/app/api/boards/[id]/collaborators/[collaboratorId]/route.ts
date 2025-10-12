import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; collaboratorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;
    const { id: boardId, collaboratorId } = await params;

    if (!role || !['editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Valid role (editor or viewer) is required' }, { status: 400 });
    }

    await connectDB();
    const models = await registerModels();

    // Check if user owns this board
    const board = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found or access denied' }, { status: 404 });
    }

    // Update collaboration
    const updatedCollaboration = await models.BoardCollaboration.findByIdAndUpdate(
      collaboratorId,
      { role },
      { new: true }
    );

    if (!updatedCollaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    const collaborationObject = updatedCollaboration.toObject ? updatedCollaboration.toObject() : updatedCollaboration;

    return NextResponse.json({ collaboration: collaborationObject });
  } catch (error) {
    console.error('Error updating collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; collaboratorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: boardId, collaboratorId } = await params;

    await connectDB();
    const models = await registerModels();

    // Check if user owns this board
    const board = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found or access denied' }, { status: 404 });
    }

    // Remove collaboration
    await models.BoardCollaboration.findByIdAndDelete(collaboratorId);

    return NextResponse.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
