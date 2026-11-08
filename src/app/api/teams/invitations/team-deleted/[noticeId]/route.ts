import { authOptions } from "@/lib/auth";
import { teamDeletedNotices } from "@/lib/team-service";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// DELETE /api/teams/invitations/team-deleted/:noticeId
// Dismiss a "your team was deleted" notice for the current user.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ noticeId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { noticeId } = await params;
  if (!mongoose.Types.ObjectId.isValid(noticeId)) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 },
    );
  }

  const { deletedCount } = await (
    await teamDeletedNotices()
  ).deleteOne({
    _id: new mongoose.Types.ObjectId(noticeId),
    email: session.user.email.toLowerCase(),
  });
  if (deletedCount === 0) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true });
}
