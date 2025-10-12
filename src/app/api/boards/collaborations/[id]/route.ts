import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;
    const collaborationId = (await params).id;

    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    await connectDB();
    const models = await registerModels();

    // Find collaboration for this user
    const collaboration = await models.BoardCollaboration.findOne({
      _id: collaborationId,
      userEmail: session.user.email.toLowerCase(),
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    // Update collaboration status
    collaboration.status = status;
    collaboration.userId = session.user.id;
    collaboration.userName = session.user.name ?? undefined;
    collaboration.userImage = session.user.image ?? undefined;
    collaboration.respondedAt = new Date();

    await collaboration.save();
    const collaborationObject = collaboration.toObject ? collaboration.toObject() : collaboration;

    return NextResponse.json({ collaboration: collaborationObject });
  } catch (error) {
    console.error('Error updating board collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collaborationId = (await params).id;

    await connectDB();
    const models = await registerModels();

    // Delete collaboration for this user
    const result = await models.BoardCollaboration.findOneAndDelete({
      _id: collaborationId,
      userEmail: session.user.email.toLowerCase(),
    });

    if (!result) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Collaboration declined successfully' });
  } catch (error) {
    console.error('Error declining board collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

