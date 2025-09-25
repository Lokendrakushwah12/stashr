import { authOptions } from "@/lib/auth";
import { registerModels } from "@/models";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// PUT /api/collaborations/[id] - Accept or decline a collaboration invitation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json() as { status?: string };
    const { status } = body;

    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    await connectDB();
    const { FolderCollaboration } = await registerModels();

    // Find the collaboration and verify it belongs to the current user
    const collaboration = await FolderCollaboration.findOne({
      _id: id,
      $or: [
        { userId: session.user.id },
        { email: { $regex: session.user.email, $options: 'i' } }
      ],
      status: 'pending'
    }).exec();

    if (!collaboration) {
      return NextResponse.json(
        { error: "Collaboration invitation not found or already processed" },
        { status: 404 }
      );
    }

    // Update the collaboration status
    collaboration.status = status as 'accepted' | 'declined';
    await collaboration.save();

    return NextResponse.json({ 
      message: `Invitation ${status} successfully`,
      collaboration: {
        _id: collaboration._id,
        status: collaboration.status,
        folderId: collaboration.folderId,
        role: collaboration.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating collaboration:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update collaboration: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update collaboration" },
      { status: 500 }
    );
  }
}

// DELETE /api/collaborations/[id] - Remove a collaboration (for declining)
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

    await connectDB();
    const { FolderCollaboration } = await registerModels();

    // Find and delete the collaboration
    const collaboration = await FolderCollaboration.findOneAndDelete({
      _id: id,
      $or: [
        { userId: session.user.id },
        { email: { $regex: session.user.email, $options: 'i' } }
      ]
    }).exec();

    if (!collaboration) {
      return NextResponse.json(
        { error: "Collaboration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Collaboration removed successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error removing collaboration:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to remove collaboration: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove collaboration" },
      { status: 500 }
    );
  }
}
