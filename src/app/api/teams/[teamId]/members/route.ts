import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { canManageTeam } from "@/lib/team-service";
import { assertWithinLimit, PlanLimitError } from "@/lib/plans";
import { planLimitResponse } from "@/lib/api-team";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { TeamRole } from "@/models/TeamMember";

const VALID_INVITE_ROLES: TeamRole[] = ["admin", "editor", "viewer"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { teamId } = await params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return NextResponse.json({ error: "Invalid team id" }, { status: 400 });
  }

  await connectDB();
  const { TeamMember } = await registerModels();

  // Make sure the requester is a member
  const me = await TeamMember.findOne({
    teamId: new mongoose.Types.ObjectId(teamId),
    userId: session.user.id,
    status: "active",
  }).lean();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await TeamMember.find({
    teamId: new mongoose.Types.ObjectId(teamId),
    status: { $in: ["active", "pending"] },
  })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({
    members: members.map((m) => ({
      id: String(m._id),
      email: m.email,
      name: m.name,
      image: m.image,
      role: m.role,
      status: m.status,
      userId: m.userId,
      invitedAt: m.invitedAt,
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { teamId } = await params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return NextResponse.json({ error: "Invalid team id" }, { status: 400 });
  }

  const body = (await request.json()) as { email?: string; role?: TeamRole };
  const email = body.email?.trim().toLowerCase();
  const role = body.role ?? "editor";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!VALID_INVITE_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

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

  // enforce member limit
  const activeCount = await TeamMember.countDocuments({
    teamId: teamObjectId,
    status: { $in: ["active", "pending"] },
  });
  try {
    assertWithinLimit({
      planId: "free",
      key: "membersPerTeam",
      current: activeCount,
    });
  } catch (e) {
    if (e instanceof PlanLimitError) return planLimitResponse(e);
    throw e;
  }

  // Check if there's an existing record for this email in the team
  const existing = await TeamMember.findOne({ teamId: teamObjectId, email });
  if (existing && existing.status !== "declined") {
    return NextResponse.json(
      { error: "This email has already been invited" },
      { status: 409 },
    );
  }

  // Try to associate to an existing user account by email
  const { Folder } = await registerModels();
  let invitedUserId: string | undefined;
  try {
    // The NextAuth adapter creates a "users" collection; lookup via mongoose native
    const db = (Folder.db as mongoose.Connection).db;
    if (db) {
      const userDoc = await db.collection("users").findOne({ email });
      if (userDoc?._id) invitedUserId = String(userDoc._id);
    }
  } catch {
    // ignore — invitedUserId stays undefined and gets linked at acceptance time
  }

  // If a declined record exists, re-open it as a fresh invitation
  let member;
  if (existing && existing.status === "declined") {
    existing.role = role;
    existing.status = "pending";
    existing.userId = invitedUserId ?? existing.userId;
    existing.invitedByUserId = session.user.id;
    existing.invitedByName = session.user.name ?? session.user.email ?? "";
    existing.invitedAt = new Date();
    existing.respondedAt = undefined;
    existing.acknowledgedByInviterAt = undefined;
    member = await existing.save();
  } else {
    member = await TeamMember.create({
      teamId: teamObjectId,
      userId: invitedUserId,
      email,
      role,
      status: "pending",
      invitedByUserId: session.user.id,
      invitedByName: session.user.name ?? session.user.email ?? "",
      invitedAt: new Date(),
    });
  }

  return NextResponse.json(
    {
      member: {
        id: String(member._id),
        email: member.email,
        role: member.role,
        status: member.status,
        invitedAt: member.invitedAt,
      },
    },
    { status: 201 },
  );
}
