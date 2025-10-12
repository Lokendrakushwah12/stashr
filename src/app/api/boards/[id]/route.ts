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
    const resolvedParams = await params;
    const boardId = resolvedParams.id;

    // Check if user owns the board
    let board = await models.Board.findOne({ _id: boardId, userId: session.user.id });
    let userRole: 'owner' | 'editor' | 'viewer' = 'owner';

    // If not owner, check if user is a collaborator
    if (!board) {
      const collaboration = await models.BoardCollaboration.findOne({
        boardId,
        userId: session.user.id,
        status: 'accepted',
      });

      if (collaboration) {
        board = await models.Board.findById(boardId);
        userRole = collaboration.role;
      }
    }

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Get cards for this board
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

    const boardObject = board.toObject ? board.toObject() : board;
    
    // Fetch linked folder if it exists
    let linkedFolder = null;
    if (boardObject.linkedFolderId) {
      const folder = await models.Folder.findById(boardObject.linkedFolderId);
      if (folder) {
        const folderObject = folder.toObject ? folder.toObject() : folder;
        linkedFolder = {
          id: folderObject._id?.toString() ?? String(folderObject._id),
          name: folderObject.name,
          color: folderObject.color ?? '#3b82f6',
        };
      }
    }

    const boardWithCards = {
      ...boardObject,
      cards: cardsWithLinkedFolders,
      cardCount: cardsWithLinkedFolders.length,
      userRole,
      linkedFolder,
    };

    return NextResponse.json({ board: boardWithCards });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, content, color, linkedFolderId } = body;
    const resolvedParams = await params;
    const boardId = resolvedParams.id;

    await connectDB();
    const models = await registerModels();

    // Check if board exists and user owns it
    let existingBoard = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    let canEdit = !!existingBoard;

    // If not owner, check if user is an editor collaborator
    if (!existingBoard) {
      const collaboration = await models.BoardCollaboration.findOne({
        boardId,
        userId: session.user.id,
        status: 'accepted',
        role: 'editor',
      });

      if (collaboration) {
        existingBoard = await models.Board.findById(boardId);
        canEdit = true;
      }
    }

    if (!existingBoard || !canEdit) {
      return NextResponse.json({ error: 'Board not found or insufficient permissions' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Board name is required' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || undefined;
    }

    if (content !== undefined) {
      updateData.content = content?.trim() || undefined;
    }

    if (color !== undefined) {
      updateData.color = color || '#3b82f6';
    }

    if (linkedFolderId !== undefined) {
      console.log('linkedFolderId received:', linkedFolderId, 'type:', typeof linkedFolderId);
      // If linkedFolderId is null, remove the link; otherwise set it
      if (linkedFolderId === null || linkedFolderId === '') {
        updateData.linkedFolderId = null;
        console.log('Unlinking folder');
      } else if (typeof linkedFolderId === 'string') {
        // Verify folder exists and user has access
        const folder = await models.Folder.findById(linkedFolderId);
        if (!folder) {
          console.log('Folder not found:', linkedFolderId);
          return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }
        console.log('Linking to folder:', linkedFolderId, folder.name);
        updateData.linkedFolderId = linkedFolderId;
      }
    }

    console.log('updateData:', updateData);

    const updatedBoard = await models.Board.findByIdAndUpdate(
      boardId,
      { $set: updateData },
      { new: true }
    );

    const boardObject = updatedBoard?.toObject ? updatedBoard.toObject() : updatedBoard;
    
    // Fetch linked folder if it exists
    let linkedFolder = null;
    if (boardObject?.linkedFolderId) {
      const folder = await models.Folder.findById(boardObject.linkedFolderId);
      if (folder) {
        const folderObject = folder.toObject ? folder.toObject() : folder;
        linkedFolder = {
          id: folderObject._id?.toString() ?? String(folderObject._id),
          name: folderObject.name,
          color: folderObject.color ?? '#3b82f6',
        };
      }
    }

    return NextResponse.json({ 
      board: {
        ...boardObject,
        linkedFolder,
      }
    });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const boardId = resolvedParams.id;

    await connectDB();
    const models = await registerModels();

    // Check if board exists and user owns it
    const existingBoard = await models.Board.findOne({ 
      _id: boardId,
      userId: session.user.id 
    });

    if (!existingBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Delete all cards associated with this board
    await models.BoardCard.deleteMany({ boardId });

    // Delete the board
    await models.Board.findByIdAndDelete(boardId);

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
