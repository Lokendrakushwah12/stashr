import { registerModels } from '@/lib/models';
import connectDB from '@/lib/mongodb';
import Folder from '@/models/Folder';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// PUT /api/bookmarks/[id] - Update a bookmark
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    await connectDB();
    const { Bookmark } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: "Invalid bookmark ID" },
        { status: 400 },
      );
    }

    const body = await request.json() as { title?: string; url?: string; description?: string };
    const { title, url, description } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Bookmark title cannot be empty" },
          { status: 400 },
        );
      }
      updateData.title = title.trim();
    }

    if (url !== undefined) {
      if (!url.trim()) {
        return NextResponse.json(
          { error: "Bookmark URL cannot be empty" },
          { status: 400 },
        );
      }

      // Validate URL format
      try {
        new URL(url.trim());
      } catch {
        return NextResponse.json(
          { error: "Please provide a valid URL" },
          { status: 400 },
        );
      }

      updateData.url = url.trim();

      // Update favicon if URL changed
      try {
        const urlObj = new URL(url.trim());
        updateData.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
      } catch {
        // Invalid URL will be caught by mongoose validation
      }
    }

    if (description !== undefined) {
      updateData.description = description?.trim() ?? "";
    }

    const bookmark = await Bookmark.findByIdAndUpdate(resolvedParams.id, updateData, {
      new: true,
      runValidators: true,
    }).exec();

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
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

// DELETE /api/bookmarks/[id] - Delete a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    await connectDB();
    const { Bookmark } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: "Invalid bookmark ID" },
        { status: 400 },
      );
    }

    const bookmark = await Bookmark.findById(resolvedParams.id).exec();
    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
    }

    // Remove bookmark from all folders
    await Folder.updateMany(
      { bookmarks: resolvedParams.id },
      { $pull: { bookmarks: resolvedParams.id } },
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
