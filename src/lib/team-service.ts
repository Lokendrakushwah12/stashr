import "server-only";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import type { TeamRole } from "@/models/TeamMember";

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  planId: "free" | "pro";
  ownerId: string;
  role: TeamRole;
  memberCount: number;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "team"
  );
}

interface UserContext {
  userId: string;
  userEmail: string;
  userName?: string | null;
  userImage?: string | null;
}

async function findExistingTeam(userId: string): Promise<string | null> {
  const { Team, TeamMember } = await registerModels();
  const existing = await TeamMember.findOne({
    userId,
    status: "active",
  })
    .sort({ createdAt: 1 })
    .lean();
  if (existing) return String(existing.teamId);

  const ownedTeam = await Team.findOne({ ownerId: userId })
    .sort({ createdAt: 1 })
    .lean();
  return ownedTeam ? String(ownedTeam._id) : null;
}

/**
 * Tag any of the user's untagged Folders/Bookmarks/Boards/BoardCards with the
 * given team id. Safe to call repeatedly — it's a no-op once everything is
 * already tagged.
 */
async function migrateUntaggedDataToTeam(
  userId: string,
  teamId: mongoose.Types.ObjectId,
): Promise<void> {
  const { Folder, Bookmark, Board, BoardCard } = await registerModels();
  const untagged = {
    userId,
    $or: [{ teamId: { $exists: false } }, { teamId: null }],
  };
  await Promise.all([
    Folder.updateMany(untagged, { $set: { teamId } }),
    Bookmark.updateMany(untagged, { $set: { teamId } }),
    Board.updateMany(untagged, { $set: { teamId } }),
    BoardCard.updateMany(untagged, { $set: { teamId } }),
  ]);
}

/**
 * Backfill helper for existing users: if a user has bookmarks/folders/boards
 * but no team, silently create a "Personal" team and migrate all their data.
 * Returns the team id, or null if the user has no legacy data (in which case
 * they should be sent through onboarding to create their first team).
 */
export async function ensureUserHasTeam(opts: UserContext): Promise<{
  teamId: string | null;
  created: boolean;
}> {
  await connectDB();
  const { Team, TeamMember, Folder, Bookmark, Board } = await registerModels();

  const existingTeamId = await findExistingTeam(opts.userId);
  if (existingTeamId) {
    const teamObjectId = new mongoose.Types.ObjectId(existingTeamId);
    // ensure membership row
    await TeamMember.updateOne(
      { teamId: teamObjectId, email: opts.userEmail.toLowerCase() },
      {
        $setOnInsert: {
          teamId: teamObjectId,
          userId: opts.userId,
          email: opts.userEmail.toLowerCase(),
          name: opts.userName ?? undefined,
          image: opts.userImage ?? undefined,
          role: "owner",
          status: "active",
          invitedAt: new Date(),
          respondedAt: new Date(),
        },
      },
      { upsert: true },
    );
    // Opportunistic migration: tag any untagged user-owned data into this team.
    // Handles cases where the team was created (e.g. via onboarding) before
    // legacy data was migrated.
    await migrateUntaggedDataToTeam(opts.userId, teamObjectId);
    return { teamId: existingTeamId, created: false };
  }

  // No team yet — check if this is an existing user with legacy data
  const hasLegacyData =
    (await Folder.exists({ userId: opts.userId })) ||
    (await Bookmark.exists({ userId: opts.userId })) ||
    (await Board.exists({ userId: opts.userId }));

  if (!hasLegacyData) {
    return { teamId: null, created: false };
  }

  // Existing user — auto-create personal team and migrate data
  const name = opts.userName?.split(" ")[0]
    ? `${opts.userName.split(" ")[0]}'s Team`
    : "Personal Team";
  const team = await Team.create({
    name,
    slug: `${slugify(name)}-${opts.userId.slice(-6)}`,
    ownerId: opts.userId,
    planId: "free",
  });

  await TeamMember.create({
    teamId: team._id,
    userId: opts.userId,
    email: opts.userEmail.toLowerCase(),
    name: opts.userName ?? undefined,
    image: opts.userImage ?? undefined,
    role: "owner",
    status: "active",
    invitedAt: new Date(),
    respondedAt: new Date(),
  });

  const teamObjectId = team._id as mongoose.Types.ObjectId;
  await migrateUntaggedDataToTeam(opts.userId, teamObjectId);

  return { teamId: String(team._id), created: true };
}

export async function listUserTeams(userId: string): Promise<TeamSummary[]> {
  await connectDB();
  const { Team, TeamMember } = await registerModels();

  const memberships = await TeamMember.find({
    userId,
    status: "active",
  })
    .lean()
    .exec();

  if (memberships.length === 0) return [];

  const teamIds = memberships.map((m) => m.teamId);
  const teams = await Team.find({ _id: { $in: teamIds } })
    .lean()
    .exec();

  const teamMap = new Map(teams.map((t) => [String(t._id), t]));

  const counts = await TeamMember.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    { $match: { teamId: { $in: teamIds }, status: "active" } },
    { $group: { _id: "$teamId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const result: TeamSummary[] = [];
  for (const m of memberships) {
    const team = teamMap.get(String(m.teamId));
    if (!team) continue;
    result.push({
      id: String(team._id),
      name: team.name,
      slug: team.slug,
      logoUrl: team.logoUrl ?? undefined,
      planId: team.planId,
      ownerId: team.ownerId,
      role: m.role,
      memberCount: countMap.get(String(team._id)) ?? 1,
    });
  }
  return result;
}

export class NoTeamError extends Error {
  constructor() {
    super("User has no active team");
    this.name = "NoTeamError";
  }
}

/**
 * Resolve the team the user is currently acting on for a request.
 * Reads the x-team-id header (set by client when switching teams),
 * falls back to the user's first active team. Validates membership.
 * Triggers legacy-data backfill if the user has untagged data.
 * Throws NoTeamError if the user has no team yet (force onboarding).
 */
export async function resolveCurrentTeam(opts: {
  userId: string;
  userEmail: string;
  userName?: string | null;
  userImage?: string | null;
  requestedTeamId?: string | null;
}): Promise<{ teamId: string; role: TeamRole }> {
  await connectDB();
  const { TeamMember } = await registerModels();

  if (
    opts.requestedTeamId &&
    mongoose.Types.ObjectId.isValid(opts.requestedTeamId)
  ) {
    const m = await TeamMember.findOne({
      teamId: new mongoose.Types.ObjectId(opts.requestedTeamId),
      userId: opts.userId,
      status: "active",
    }).lean();
    if (m) return { teamId: String(m.teamId), role: m.role };
  }

  const first = await TeamMember.findOne({
    userId: opts.userId,
    status: "active",
  })
    .sort({ createdAt: 1 })
    .lean();

  if (first) return { teamId: String(first.teamId), role: first.role };

  const { teamId } = await ensureUserHasTeam(opts);
  if (!teamId) throw new NoTeamError();
  return { teamId, role: "owner" };
}

export function canWrite(role: TeamRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canManageTeam(role: TeamRole): boolean {
  return role === "owner" || role === "admin";
}
