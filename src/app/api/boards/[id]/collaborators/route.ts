import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const models = await registerModels();
    const boardId = (await params).id;

    // Check if user has access to this board
    const board = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Get all collaborations for this board
    const collaborations = await models.BoardCollaboration.find({ boardId });
    const collaborationsArray = collaborations.map(c => c.toObject ? c.toObject() : c);

    return NextResponse.json({ collaborations: collaborationsArray });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role } = body;
    const boardId = (await params).id;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

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

    // Check if collaboration already exists
    const existingCollaboration = await models.BoardCollaboration.findOne({
      boardId,
      userEmail: email.toLowerCase()
    });

    if (existingCollaboration) {
      return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
    }

    // Create new collaboration
    const collaborationData = {
      boardId,
      userEmail: email.toLowerCase(),
      role,
      invitedBy: session.user.id,
      status: 'pending',
    };

    console.log('Creating collaboration with data:', collaborationData);

    const collaboration = await models.BoardCollaboration.create(collaborationData);
    const collaborationObject = collaboration.toObject ? collaboration.toObject() : collaboration;

    return NextResponse.json({ collaboration: collaborationObject }, { status: 201 });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && 'errors' in error) {
      console.error('Validation errors:', (error as { errors: unknown }).errors);
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
