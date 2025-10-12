import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const models = await registerModels();
    const boardId = params.id;

    // Verify user owns the board
    const board = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const cards = await models.BoardCard.find({ boardId });

    // Add linked folder information for cards that have linkedFolderId
    const cardsWithLinkedFolders = await Promise.all(
      cards.map(async (card) => {
        const cardObject = card.toObject ? card.toObject() : card;
        if (cardObject.linkedFolderId) {
          const linkedFolder = await models.Folder.findOne({ 
            _id: cardObject.linkedFolderId 
          });
          if (linkedFolder) {
            const folderObject = linkedFolder.toObject ? linkedFolder.toObject() : linkedFolder;
            return {
              ...cardObject,
              linkedFolder: {
                id: folderObject._id?.toString() ?? String(folderObject._id),
                name: folderObject.name,
                color: folderObject.color ?? '#3b82f6',
              },
            };
          }
        }
        return cardObject;
      })
    );

    return NextResponse.json({ cards: cardsWithLinkedFolders });
  } catch (error) {
    console.error('Error fetching board cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
    const boardId = params.id;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Card title is required' }, { status: 400 });
    }

    await connectDB();
    const models = await registerModels();

    // Verify user owns the board
    const board = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const card = {
      title: title.trim(),
      description: description?.trim() || undefined,
      status: status || 'todo',
      priority: priority || 'medium',
      linkedFolderId: linkedFolderId || undefined,
      boardId,
      userId: session.user.id,
    };

    const createdCard = await models.BoardCard.create(card);
    const cardObject = createdCard.toObject ? createdCard.toObject() : createdCard;

    // Add linked folder information if applicable
    if (createdCard.linkedFolderId) {
      const linkedFolder = await models.Folder.findOne({ 
        _id: createdCard.linkedFolderId 
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
        }, { status: 201 });
      }
    }

    return NextResponse.json({ card: cardObject }, { status: 201 });
  } catch (error) {
    console.error('Error creating board card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
