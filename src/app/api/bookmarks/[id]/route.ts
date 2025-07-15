import { registerModels } from '@/lib/models';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { BookmarkDocument } from '@/models/Bookmark';

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
    const { Bookmark } = await registerModels();

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
    const updateData: Partial<Pick<BookmarkDocument, 'title' | 'url' | 'description' | 'favicon'>> = {};
    if (title) updateData.title = title.trim();
    if (url) updateData.url = url.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';

    // Try to get favicon from URL if updated
    if (url) {
      try {
        const urlObj = new URL(url.trim());
        updateData.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
      } catch {
        // Invalid URL will be caught by mongoose validation
      }
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: resolvedParams.id, userId: session.user.id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('folderId')
      .exec();

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({ bookmark }, { status: 200 });
  } catch (error) {
    console.error("Error updating bookmark:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update bookmark: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 },
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
    const { Bookmark, Folder } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid bookmark ID" }, { status: 400 });
    }

    const bookmark = await Bookmark.findOne({
      _id: resolvedParams.id,
      userId: session.user.id
    }).exec();
    
    if (!bookmark) {
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
