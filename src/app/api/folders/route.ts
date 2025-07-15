import { registerModels } from "@/lib/models";
import connectDB from "@/lib/mongodb";
import type { CreateFolderRequest } from "@/types";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


// GET /api/folders - Get all folders with their bookmarks
export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const { Folder } = await registerModels();

    const folders = await Folder.find({})
      .populate("bookmarks")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json({ folders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching folders:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch folders: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 },
    );
  }
}

// POST /api/folders - Create a new folder
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const { Folder } = await registerModels();

    const body = await request.json() as CreateFolderRequest;
    const { name, description, color } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();

    // Check for existing folder with same name
    const existingFolder = await Folder.findOne({ name: trimmedName }).exec();
    if (existingFolder) {
      return NextResponse.json(
        { error: "Folder with this name already exists" },
        { status: 409 },
      );
    }

    // Validate color format if provided
    if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return NextResponse.json(
        { error: "Please provide a valid hex color code" },
        { status: 400 },
      );
    }

    // Create new folder
    const folderData = {
      name: trimmedName,
      description: description?.trim() ?? "",
      color: color ?? "#3B82F6",
      bookmarks: [],
    };

    const folder = new Folder(folderData);
    await folder.save();

    // Populate bookmarks and return
    await folder.populate("bookmarks");

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);

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
        { error: `Failed to create folder: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
