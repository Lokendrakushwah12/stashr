import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { canManageTeam } from "@/lib/team-service";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function loadMembership(userId: string, teamId: string) {
  if (!mongoose.Types.ObjectId.isValid(teamId)) return null;
  const { TeamMember } = await registerModels();
  return TeamMember.findOne({
    teamId: new mongoose.Types.ObjectId(teamId),
    userId,
    status: "active",
  }).lean();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { teamId } = await params;
  await connectDB();
  const membership = await loadMembership(session.user.id, teamId);
  if (!membership) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
  if (!canManageTeam(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { name?: string; logoUrl?: string };
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    update.name = body.name.trim();
  }
  if (typeof body.logoUrl === "string") {
    update.logoUrl = body.logoUrl.trim();
  }

  const { Team } = await registerModels();
  const team = await Team.findByIdAndUpdate(teamId, update, {
    new: true,
  }).lean();
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json({
    team: {
      id: String(team._id),
      name: team.name,
      slug: team.slug,
      logoUrl: team.logoUrl,
      planId: team.planId,
      ownerId: team.ownerId,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { teamId } = await params;
  await connectDB();
  const membership = await loadMembership(session.user.id, teamId);
  if (!membership) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
  if (membership.role !== "owner") {
    return NextResponse.json(
      { error: "Only the owner can delete a team" },
      { status: 403 },
    );
  }

  const { Team, TeamMember } = await registerModels();
  await TeamMember.deleteMany({ teamId: new mongoose.Types.ObjectId(teamId) });
  await Team.findByIdAndDelete(teamId);
  return NextResponse.json({ success: true });
}
