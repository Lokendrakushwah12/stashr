import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { registerModels } from '@/models';
import mongoose from 'mongoose';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const models = await registerModels();

    // Get all boards with content
    const boards = await models.Board.find({ content: { $exists: true, $ne: '' } });

    let migratedCount = 0;
    let totalEntries = 0;

    for (const board of boards) {
      const content = board.content;
      if (!content) continue;

      // Split by separator
      const parts = content.split('\n\n---\n');
      
      for (const it of parts) {
        const part = it?.trim();
        if (!part) continue;

        // Check if this part has metadata (userName, role, timestamp)
        const metadataMatch = /^\*\*(.+?)\*\* \((.+?)\) • (.+?)\n\n([\s\S]+)$/.exec(part);
        
        let userName, userRole, timestamp, entryContent;
        
        if (metadataMatch) {
          [, userName, userRole, timestamp, entryContent] = metadataMatch;
        } else {
          // No metadata, treat as owner's initial content
          userName = board.userId; // Will need to fetch user data
          userRole = 'owner';
          timestamp = board.createdAt?.toISOString();
          entryContent = part;
        }

        // Try to find userId from userName or use board owner
        let userId = board.userId;
        let userEmail = '';
        let userImage = '';

        // Fetch user data to get email
        const user = await mongoose.connection.collection('users').findOne({
          _id: new mongoose.Types.ObjectId(board.userId),
        });

        if (user) {
          userEmail = user.email || '';
          userImage = user.image || '';
          
          // If userName matches user name, use their data
          if (user.name === userName) {
            userId = board.userId;
          }
        }

        // Parse timestamp to Date
        let createdAt = new Date();
        if (timestamp) {
          const parsedDate = new Date(timestamp);
          if (!isNaN(parsedDate.getTime())) {
            createdAt = parsedDate;
          } else {
            // Try parsing DD/MM/YYYY format
            const parts = /(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/.exec(timestamp);
            if (parts) {
              const [, day, month, year, hours, minutes, seconds] = parts;
              const parsed = new Date(`${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}T${hours?.padStart(2, '0')}:${minutes?.padStart(2, '0')}:${seconds?.padStart(2, '0')}`);
              if (!isNaN(parsed.getTime())) {
                createdAt = parsed;
              }
            }
          }
        }

        // Check if entry already exists
        const existing = await models.BoardTimelineEntry.findOne({
          boardId: board._id?.toString(),
          userId,
          content: entryContent?.trim(),
          createdAt,
        });

        if (!existing) {
          await models.BoardTimelineEntry.create({
            boardId: board._id?.toString(),
            userId,
            userEmail,
            userName: userName ?? user?.name ?? 'Unknown',
            userImage,
            userRole: userRole as 'owner' | 'editor' | 'viewer',
            content: entryContent?.trim() ?? part,
            action: 'created',
            createdAt,
          });
          totalEntries++;
        }
      }

      migratedCount++;
    }

    return NextResponse.json({ 
      message: 'Migration completed',
      boardsMigrated: migratedCount,
      entriesCreated: totalEntries,
    });
  } catch (error) {
    console.error('Error migrating timeline entries:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

