import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import type { CreateBookmarkRequest } from '@/types';
import { registerModels } from '@/models';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractImageUrl } from '@/lib/meta-image-extractor';

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
    const { Bookmark, Folder, FolderCollaboration } = await registerModels();
    
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
    
    // Check if folder exists and user has access (owner or collaborator)
    const folder = await Folder.findById(folderId).exec();
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Check if user is owner or has editor role
    const isOwner = folder.userId === session.user.id;
    
    if (!isOwner) {
      const collaboration = await FolderCollaboration.findOne({
        folderId: folderId,
        userId: session.user.id,
        status: 'accepted',
        role: 'editor'
      }).exec();

      if (!collaboration) {
        return NextResponse.json(
          { error: 'You do not have permission to add bookmarks to this folder' },
          { status: 403 }
        );
      }
    }

    // Check if bookmark with same URL already exists for this user
    // Normalize URL by removing trailing slashes and ensuring consistent protocol
    const normalizedUrl = url.trim().replace(/\/$/, '');
    
    // Check for exact match first
    let existingBookmark = await Bookmark.findOne({
      url: normalizedUrl,
      userId: session.user.id
    }).exec();

    // If no exact match, check for variations (with/without trailing slash, different protocols)
    if (!existingBookmark) {
      const urlVariations = [
        normalizedUrl,
        normalizedUrl + '/',
        normalizedUrl.replace(/^https?:\/\//, 'http://'),
        normalizedUrl.replace(/^https?:\/\//, 'https://')
      ];
      
      existingBookmark = await Bookmark.findOne({
        url: { $in: urlVariations },
        userId: session.user.id
      }).exec();
    }

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'A bookmark with this URL already exists' },
        { status: 409 }
      );
    }
    
    // Try to get favicon from URL
    let favicon = '';
    try {
      const urlObj = new URL(normalizedUrl);
      favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      // Invalid URL will be caught by mongoose validation
    }
    
    // Extract meta image using metascraper
    let metaImage = '';
    try {
      console.log(`🔍 Creating bookmark: Extracting meta image for ${normalizedUrl}`);
      metaImage = await extractImageUrl(normalizedUrl);
      console.log(`✅ Bookmark creation: Meta image extracted: ${metaImage}`);
    } catch (error) {
      console.error('❌ Bookmark creation: Error extracting meta image:', error);
    }
    
    // Create new bookmark
    const bookmark = new Bookmark({
      title: title.trim(),
      url: normalizedUrl,
      description: description?.trim() ?? '',
      favicon,
      metaImage,
      userId: session.user.id,
      folderId,
    });
    
    try {
      await bookmark.save();
    } catch (error) {
      // Check if it's a duplicate key error
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A bookmark with this URL already exists' },
          { status: 409 }
        );
      }
      throw error; // Re-throw other errors
    }
    
    // Add bookmark to folder
    folder.bookmarks.push(bookmark._id as mongoose.Types.ObjectId);
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