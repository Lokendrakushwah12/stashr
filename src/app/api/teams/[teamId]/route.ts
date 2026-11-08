import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { deleteBoardActivity } from "@/lib/board-activity";
import { canManageTeam, teamDeletedNotices } from "@/lib/team-service";
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

  const body = (await request.json()) as {
    name?: string;
    logoUrl?: string;
    theme?: "default" | "ocean" | "forest" | "custom";
    customColor?: string;
  };
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    update.name = body.name.trim();
  }
  if (typeof body.logoUrl === "string") {
    update.logoUrl = body.logoUrl.trim();
  }
  if (
    typeof body.theme === "string" &&
    ["default", "ocean", "forest", "custom"].includes(body.theme)
  ) {
    update.theme = body.theme;
  }
  if (typeof body.customColor === "string") {
    const hex = body.customColor.trim();
    if (hex === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
      update.customColor = hex;
    } else {
      return NextResponse.json(
        { error: "customColor must be a hex color (e.g. #4f46e5)" },
        { status: 400 },
      );
    }
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
      theme: team.theme ?? "default",
      customColor: team.customColor ?? "",
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

  const m = await registerModels();
  const tid = new mongoose.Types.ObjectId(teamId);
  const [team, members, boards, folders] = await Promise.all([
    m.Team.findById(teamId).lean(),
    m.TeamMember.find(
      { teamId: tid, status: "active", userId: { $ne: session.user.id } },
      { email: 1 },
    ).lean(),
    m.Board.find({ teamId: tid }, { _id: 1 }).lean(),
    m.Folder.find({ teamId: tid }, { _id: 1 }).lean(),
  ]);
  const boardIds = boards.map((b) => String(b._id));
  const folderIds = folders.map((f) => f._id);

  // Children, then parents, then the team last: if anything fails part-way the
  // team still exists and the owner can simply retry.
  await Promise.all([
    m.BoardCard.deleteMany({
      $or: [{ teamId: tid }, { boardId: { $in: boardIds } }],
    }),
    m.BoardTimelineEntry.deleteMany({ boardId: { $in: boardIds } }),
    m.BoardCollaboration.deleteMany({ boardId: { $in: boardIds } }),
    deleteBoardActivity(boardIds),
    m.FolderCollaboration.deleteMany({ folderId: { $in: folderIds } }),
    m.Bookmark.deleteMany({
      $or: [{ teamId: tid }, { folderId: { $in: folderIds } }],
    }),
  ]);
  await Promise.all([
    m.Board.deleteMany({ teamId: tid }),
    m.Folder.deleteMany({ teamId: tid }),
    m.TeamMember.deleteMany({ teamId: tid }),
  ]);
  await m.Team.findByIdAndDelete(teamId);

  // Last, so a retried delete can't notify anyone twice.
  if (team && members.length > 0) {
    const deletedAt = new Date();
    await (
      await teamDeletedNotices()
    ).insertMany(
      members.map((mem) => ({
        email: mem.email,
        teamName: team.name,
        teamLogoUrl: team.logoUrl ?? "",
        deletedByName: session.user.name ?? null,
        deletedAt,
      })),
    );
  }
  return NextResponse.json({ success: true });
}
