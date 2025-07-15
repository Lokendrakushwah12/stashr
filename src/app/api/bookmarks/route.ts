import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import Folder from '@/models/Folder';
import { CreateBookmarkRequest } from '@/types';
import { registerModels } from '@/lib/models';

// POST /api/bookmarks - Create a new bookmark and add it to a folder
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const { Bookmark, Folder } = await registerModels();
    
    const body: CreateBookmarkRequest = await request.json();
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
    
    // Check if folder exists
    const folder = await Folder.findById(folderId).exec();
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
    
    // Create bookmark
    const bookmarkData = {
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || '',
      favicon,
    };
    
    const bookmark = new Bookmark(bookmarkData);
    await bookmark.save();

    // Add bookmark to folder, ensuring correct ObjectId type
    if (bookmark._id && mongoose.Types.ObjectId.isValid(bookmark._id.toString())) {
      folder.bookmarks.push(new mongoose.Types.ObjectId(bookmark._id.toString()));
    } else {
      return NextResponse.json(
        { error: 'Invalid bookmark ID' },
        { status: 500 }
      );
    }
    await folder.save();

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
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