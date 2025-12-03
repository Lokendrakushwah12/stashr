import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';
import type { BoardTimelineEntryDocument } from '@/models/BoardTimelineEntry';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, images } = body;
    const resolvedParams = await params;
    const entryId = resolvedParams.entryId;

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

    // Build update object
    const updateData: { content: string; action: string; images?: string[] } = {
      content: content.trim(),
      action: 'updated',
    };
    
    // Always update images if provided
    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? images : [];
    }
    
    // Use findByIdAndUpdate to ensure the update is persisted
    const updatedEntry = await models.BoardTimelineEntry.findByIdAndUpdate(
      entryId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedEntry) {
      return NextResponse.json({ error: 'Entry not found after update' }, { status: 404 });
    }
    
    // Get the entry from DB to ensure we have the latest data
    const entryFromDB = await models.BoardTimelineEntry.findById(entryId).lean() as (BoardTimelineEntryDocument & { images?: string[] }) | null;
    const entryObject = (updatedEntry.toObject ? updatedEntry.toObject() : updatedEntry) as BoardTimelineEntryDocument & { images?: string[] };
    const updatedEntryAsDoc = updatedEntry as unknown as BoardTimelineEntryDocument & { images?: string[] };

    // Use the images from the request if DB doesn't have it, or use DB value
    const imagesValue = entryFromDB?.images ?? updatedEntryAsDoc.images ?? entryObject.images ?? (images !== undefined ? (Array.isArray(images) ? images : []) : []);

    return NextResponse.json({ 
      entry: {
        ...entryObject,
        images: imagesValue,
      }
    });
  } catch (error) {
    console.error('Error updating timeline entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const entryId = resolvedParams.entryId;

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

