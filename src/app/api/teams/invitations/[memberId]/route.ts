import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// POST /api/teams/invitations/:memberId - accept or decline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { memberId } = await params;
  const body = (await request.json()) as { action?: "accept" | "decline" };

  await connectDB();
  const { TeamMember } = await registerModels();

  const member = await TeamMember.findById(memberId);
  if (!member) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 },
    );
  }
  if (member.email !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (member.status !== "pending") {
    return NextResponse.json(
      { error: "Invitation already responded to" },
      { status: 400 },
    );
  }

  if (body.action === "accept") {
    member.status = "active";
    member.userId = session.user.id;
    if (!member.name) member.name = session.user.name ?? undefined;
    if (!member.image) member.image = session.user.image ?? undefined;
    member.respondedAt = new Date();
    await member.save();
    return NextResponse.json({ success: true, status: "active" });
  }

  if (body.action === "decline") {
    member.status = "declined";
    member.respondedAt = new Date();
    await member.save();
    return NextResponse.json({ success: true, status: "declined" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE /api/teams/invitations/:memberId — dismiss a decline notification.
// Only the inviter can dismiss, and only for declined invitations.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { memberId } = await params;

  await connectDB();
  const { TeamMember } = await registerModels();

  const member = await TeamMember.findById(memberId);
  if (!member) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 },
    );
  }
  if (member.invitedByUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (member.status !== "declined") {
    return NextResponse.json(
      { error: "Only declined invitations can be dismissed" },
      { status: 400 },
    );
  }

  member.acknowledgedByInviterAt = new Date();
  await member.save();
  return NextResponse.json({ success: true });
}
