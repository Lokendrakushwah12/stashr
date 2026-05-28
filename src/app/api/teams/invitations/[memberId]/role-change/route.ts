import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// DELETE /api/teams/invitations/:memberId/role-change
// Acknowledge a role-change notification for the current user.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { memberId } = await params;

  await connectDB();
  const { TeamMember } = await registerModels();

  const member = await TeamMember.findById(memberId);
  if (!member) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 },
    );
  }
  if (member.email !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  member.roleChangeAcknowledgedAt = new Date();
  await member.save();
  return NextResponse.json({ success: true });
}
