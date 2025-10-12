import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;
    const entryId = params.entryId;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    await connectDB();
    const models = await registerModels();

    // Find the entry
    const entry = await models.BoardTimelineEntry.findById(entryId);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Check if user owns this entry
    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own entries' }, { status: 403 });
    }

    // Update the entry
    entry.content = content.trim();
    entry.action = 'updated';
    await entry.save();

    const entryObject = entry.toObject ? entry.toObject() : entry;

    return NextResponse.json({ entry: entryObject });
  } catch (error) {
    console.error('Error updating timeline entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entryId = params.entryId;

    await connectDB();
    const models = await registerModels();

    // Find and delete the entry
    const entry = await models.BoardTimelineEntry.findById(entryId);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Check if user owns this entry
    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own entries' }, { status: 403 });
    }

    await models.BoardTimelineEntry.findByIdAndDelete(entryId);

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timeline entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

