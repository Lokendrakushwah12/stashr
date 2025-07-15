import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import type { CreateBookmarkRequest } from '@/types';
import { registerModels } from '@/lib/models';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/bookmarks - Create a new bookmark and add it to a folder for the authenticated user
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { Bookmark, Folder } = await registerModels();
    
    const body = await request.json() as CreateBookmarkRequest;
    const { title, url, description, folderId } = body;
    
    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Bookmark title is required' },
        { status: 400 }
      );
    }
    
    if (!url?.trim()) {
      return NextResponse.json(
        { error: 'Bookmark URL is required' },
        { status: 400 }
      );
    }
    
    if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
      return NextResponse.json(
        { error: 'Valid folder ID is required' },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }
    
    // Check if folder exists and belongs to the user
    const folder = await Folder.findOne({
      _id: folderId,
      userId: session.user.id
    }).exec();
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    // Try to get favicon from URL
    let favicon = '';
    try {
      const urlObj = new URL(url.trim());
      favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      // Invalid URL will be caught by mongoose validation
    }
    
    // Create new bookmark
    const bookmark = new Bookmark({
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || '',
      favicon,
      userId: session.user.id,
      folderId,
    });
    
    await bookmark.save();
    
    // Add bookmark to folder
    folder.bookmarks.push(bookmark._id);
    await folder.save();
    
    // Populate folder reference and return
    await bookmark.populate('folderId');
    
    return NextResponse.json(
      { bookmark: bookmark.toObject() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bookmark:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create bookmark: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
} 