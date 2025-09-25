import { authOptions } from "@/lib/auth";
import { registerModels } from "@/models";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/folders/[id]/collaborators - Get collaborators for a folder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const { Folder, FolderCollaboration } = await registerModels();

    const folder = await Folder.findById(id)
      .select("_id name userId")
      .lean()
      .exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = folder.userId === session.user.id;
    const collaboration = await FolderCollaboration.findOne({
      folderId: id,
      userId: session.user.id,
      status: 'accepted'
    }).lean().exec();

    if (!isOwner && !collaboration) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all collaborators for this folder (including pending)
    const collaborators = await FolderCollaboration.find({
      folderId: id
    }).select('userId email role invitedBy status createdAt').lean().exec();

    return NextResponse.json({ collaborators }, { status: 200 });
  } catch (error) {
    console.error("Error fetching collaborators:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch collaborators: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// POST /api/folders/[id]/collaborators - Add a collaborator to a folder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email, role = 'editor' } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'editor' or 'viewer'" },
        { status: 400 }
      );
    }

    await connectDB();
    const { Folder, FolderCollaboration } = await registerModels();

    const folder = await Folder.findById(id).exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Check if user is the owner
    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Only folder owner can add collaborators" }, { status: 403 });
    }

    // Check if collaborator already exists
    const existingCollaboration = await FolderCollaboration.findOne({
      folderId: id,
      email: email.trim().toLowerCase()
    }).exec();

    if (existingCollaboration) {
      return NextResponse.json(
        { error: "User is already a collaborator or has a pending invitation" },
        { status: 409 }
      );
    }

    // Create new collaboration
    const newCollaboration = new FolderCollaboration({
      folderId: id,
      userId: email.trim(), // In production, you'd look up the actual user ID by email
      email: email.trim().toLowerCase(),
      role,
      invitedBy: session.user.id,
      status: 'pending', // In production, you might auto-accept or send an email invitation
    });

    await newCollaboration.save();

    return NextResponse.json({ 
      collaboration: {
        _id: newCollaboration._id,
        userId: newCollaboration.userId,
        email: newCollaboration.email,
        role: newCollaboration.role,
        status: newCollaboration.status,
        createdAt: newCollaboration.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding collaborator:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to add collaborator: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id]/collaborators - Remove a collaborator from a folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json(
        { error: "Collaborator ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const { Folder, FolderCollaboration } = await registerModels();

    const folder = await Folder.findById(id).exec();

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Check if user is the owner
    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Only folder owner can remove collaborators" }, { status: 403 });
    }

    const collaboration = await FolderCollaboration.findOne({
      _id: collaboratorId,
      folderId: id
    }).exec();

    if (!collaboration) {
      return NextResponse.json({ error: "Collaboration not found" }, { status: 404 });
    }

    await FolderCollaboration.findByIdAndDelete(collaboratorId).exec();

    return NextResponse.json({ message: "Collaborator removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing collaborator:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to remove collaborator: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
}
