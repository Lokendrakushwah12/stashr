import { registerModels } from '@/models';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { BookmarkDocument } from '@/types/database';
import { extractImageUrl } from '@/lib/meta-image-extractor';

// PUT /api/bookmarks/[id] - Update a bookmark for the authenticated user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await connectDB();
    const { Bookmark, FolderCollaboration } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid bookmark ID" }, { status: 400 });
    }

    const body = await request.json() as { title?: string; url?: string; description?: string };
    const { title, url, description } = body;

    // Validate input
    if (title && !title.trim()) {
      return NextResponse.json(
        { error: "Bookmark title cannot be empty" },
        { status: 400 },
      );
    }

    if (url) {
      try {
        new URL(url.trim());
      } catch {
        return NextResponse.json(
          { error: "Please provide a valid URL" },
          { status: 400 },
        );
      }
    }

    // Build update data
    const updateData: Partial<Pick<BookmarkDocument, 'title' | 'url' | 'description' | 'favicon' | 'metaImage'>> = {};
    if (title) updateData.title = title.trim();
    if (url) updateData.url = url.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';

    // Try to get favicon and meta image from URL if updated
    if (url) {
      try {
        const urlObj = new URL(url.trim());
        updateData.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
        
        // Extract meta image for the new URL using metascraper
        console.log(`🔍 Updating bookmark: Extracting meta image for ${url.trim()}`);
        const metaImage = await extractImageUrl(url.trim());
        updateData.metaImage = metaImage;
        console.log(`✅ Bookmark update: Meta image extracted: ${metaImage}`);
      } catch (error) {
        console.error('❌ Bookmark update: Error extracting meta image:', error);
      }
    }

    // First, find the bookmark to check permissions
    const existingBookmark = await Bookmark.findById(resolvedParams.id).exec();
    
    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Check if user owns the bookmark or is an editor collaborator on the folder
    let canEdit = existingBookmark.userId === session.user.id;
    
    if (!canEdit) {
      // Check if user is an editor collaborator on the folder
      const collaboration = await FolderCollaboration.findOne({
        folderId: existingBookmark.folderId,
        $or: [
          { userId: session.user.id },
          { email: session.user.email }
        ],
        status: 'accepted',
        role: 'editor'
      }).exec();
      
      if (collaboration) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Update the bookmark
    const bookmark = await Bookmark.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true, runValidators: true }
    ).exec();

    return NextResponse.json(
      { bookmark: bookmark?.toObject() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating bookmark:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update bookmark: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookmarks/[id] - Delete a bookmark for the authenticated user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await connectDB();
    const { Bookmark, Folder, FolderCollaboration } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid bookmark ID" }, { status: 400 });
    }

    // First, find the bookmark to check permissions
    const bookmark = await Bookmark.findById(resolvedParams.id).exec();
    
    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    // Check if user owns the bookmark or is an editor collaborator on the folder
    let canDelete = bookmark.userId === session.user.id;
    
    if (!canDelete) {
      // Check if user is an editor collaborator on the folder
      const collaboration = await FolderCollaboration.findOne({
        folderId: bookmark.folderId,
        $or: [
          { userId: session.user.id },
          { email: session.user.email }
        ],
        status: 'accepted',
        role: 'editor'
      }).exec();
      
      if (collaboration) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    // Remove bookmark from folder
    await Folder.findByIdAndUpdate(
      bookmark.folderId,
      { $pull: { bookmarks: bookmark._id } }
    ).exec();

    // Delete the bookmark
    await Bookmark.findByIdAndDelete(resolvedParams.id).exec();

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting bookmark:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to delete bookmark: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 },
    );
  }
}
