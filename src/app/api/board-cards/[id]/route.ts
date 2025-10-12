import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, priority, linkedFolderId } = body;
    const cardId = params.id;

    await connectDB();
    const models = await registerModels();

    // Check if card exists and user owns it
    const existingCard = await models.BoardCard.findOne({ 
      _id: cardId,
      userId: session.user.id 
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ error: 'Card title is required' }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || undefined;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (linkedFolderId !== undefined) {
      updateData.linkedFolderId = linkedFolderId || undefined;
    }

    const updatedCard = await models.BoardCard.findByIdAndUpdate(
      cardId,
      { $set: updateData },
      { new: true }
    );

    const cardObject = updatedCard?.toObject ? updatedCard.toObject() : updatedCard;

    // Add linked folder information if applicable
    if (updatedCard?.linkedFolderId) {
      const linkedFolder = await models.Folder.findOne({ 
        _id: updatedCard.linkedFolderId 
      });
      if (linkedFolder) {
        const folderObject = linkedFolder.toObject ? linkedFolder.toObject() : linkedFolder;
        return NextResponse.json({ 
          card: {
            ...cardObject,
            linkedFolder: {
              id: folderObject._id?.toString() ?? String(folderObject._id),
              name: folderObject.name,
              color: folderObject.color ?? '#3b82f6',
            },
          }
        });
      }
    }

    return NextResponse.json({ card: cardObject });
  } catch (error) {
    console.error('Error updating board card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cardId = params.id;

    await connectDB();
    const models = await registerModels();

    // Check if card exists and user owns it
    const existingCard = await models.BoardCard.findOne({ 
      _id: cardId,
      userId: session.user.id 
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    await models.BoardCard.findByIdAndDelete(cardId);

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting board card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
