import { authOptions } from "@/lib/auth";
import { registerModels } from "@/models";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/collaborations/pending - Get pending collaboration invitations for the current user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { FolderCollaboration, Folder } = await registerModels();

    // Get all collaborations for the current user (pending and accepted)
    // Note: In production, you'd look up the user's email from their profile
    // For now, we'll search by both userId and email patterns
    const collaborations = await FolderCollaboration.find({
      $or: [
        { userId: session.user.id, status: { $in: ['pending', 'accepted'] } },
        { email: { $regex: session.user.email, $options: 'i' }, status: { $in: ['pending', 'accepted'] } }
      ]
    })
      .populate('folderId', 'name description color')
      .select('folderId email role invitedByUserId invitedByUserName status createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Transform the data to include folder information
    const invitations = collaborations.map(collab => ({
      _id: collab._id,
      folderId: collab.folderId._id || collab.folderId, // Get the actual ID
      folder: collab.folderId, // This will be the populated folder data
      email: collab.email,
      role: collab.role,
      invitedByUserId: collab.invitedByUserId,
      invitedByUserName: collab.invitedByUserName,
      status: collab.status,
      createdAt: collab.createdAt
    }));

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending invitations:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch invitations: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
