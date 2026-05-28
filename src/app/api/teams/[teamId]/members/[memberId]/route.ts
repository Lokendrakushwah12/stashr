import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { canManageTeam } from "@/lib/team-service";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { TeamRole } from "@/models/TeamMember";

const VALID_ROLES: TeamRole[] = ["admin", "editor", "viewer"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { teamId, memberId } = await params;
  await connectDB();
  const { TeamMember } = await registerModels();
  const teamObjectId = new mongoose.Types.ObjectId(teamId);

  const me = await TeamMember.findOne({
    teamId: teamObjectId,
    userId: session.user.id,
    status: "active",
  }).lean();
  if (!me || !canManageTeam(me.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await TeamMember.findOne({
    _id: memberId,
    teamId: teamObjectId,
  });
  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Cannot change the owner's role" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { role?: TeamRole };
  if (!body.role || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (target.role !== body.role) {
    target.previousRole = target.role;
    target.role = body.role;
    target.roleChangedAt = new Date();
    target.roleChangedByName =
      session.user.name ?? session.user.email ?? "Someone";
    target.roleChangeAcknowledgedAt = undefined;
    await target.save();
  }

  return NextResponse.json({
    member: {
      id: String(target._id),
      email: target.email,
      role: target.role,
      status: target.status,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { teamId, memberId } = await params;
  await connectDB();
  const { TeamMember } = await registerModels();
  const teamObjectId = new mongoose.Types.ObjectId(teamId);

  const me = await TeamMember.findOne({
    teamId: teamObjectId,
    userId: session.user.id,
    status: "active",
  }).lean();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await TeamMember.findOne({
    _id: memberId,
    teamId: teamObjectId,
  });
  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  const removingSelf = target.userId === session.user.id;
  if (!removingSelf && !canManageTeam(me.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove the team owner" },
      { status: 400 },
    );
  }

  await target.deleteOne();
  return NextResponse.json({ success: true });
}
