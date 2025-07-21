import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import type { FolderDocument } from "@/types/database";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/folders/[id] - Get a specific folder with its bookmarks for the authenticated user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    const { Folder, Bookmark } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const folder = await Folder.findOne({
      _id: resolvedParams.id,
      userId: session.user.id,
    })
      .populate("bookmarks")
      .lean()
      .exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder }, { status: 200 });
  } catch (error) {
    console.error("Error fetching folder:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch folder: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 },
    );
  }
}

// PUT /api/folders/[id] - Update a folder for the authenticated user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    const { Folder, Bookmark } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      color?: string;
    };
    const { name, description, color } = body;

    // Validate input
    if (name && !name.trim()) {
      return NextResponse.json(
        { error: "Folder name cannot be empty" },
        { status: 400 },
      );
    }

    if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return NextResponse.json(
        { error: "Please provide a valid hex color code" },
        { status: 400 },
      );
    }

    // Check if name already exists for this user (excluding current folder)
    if (name) {
      const existingFolder = await Folder.findOne({
        name: name.trim(),
        userId: session.user.id,
        _id: { $ne: resolvedParams.id },
      }).exec();

      if (existingFolder) {
        return NextResponse.json(
          { error: "A folder with this name already exists" },
          { status: 409 },
        );
      }
    }

    // Build update data
    const updateData: Partial<FolderDocument> = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() ?? "";
    if (color) updateData.color = color;

    const folder = await Folder.findOneAndUpdate(
      { _id: resolvedParams.id, userId: session.user.id },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("bookmarks")
      .exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder }, { status: 200 });
  } catch (error) {
    console.error("Error updating folder:", error);

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
        { error: `Failed to update folder: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 },
    );
  }
}

// DELETE /api/folders/[id] - Delete a folder and its bookmarks for the authenticated user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    const { Folder, Bookmark } = await registerModels();

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const folder = await Folder.findOne({
      _id: resolvedParams.id,
      userId: session.user.id,
    }).exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Delete all bookmarks in this folder that belong to the user
    if (folder.bookmarks.length > 0) {
      await Bookmark.deleteMany({
        _id: { $in: folder.bookmarks },
        userId: session.user.id,
      }).exec();
    }

    // Delete the folder
    await Folder.findByIdAndDelete(resolvedParams.id).exec();

    return NextResponse.json(
      { message: "Folder and its bookmarks deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting folder:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to delete folder: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 },
    );
  }
}
