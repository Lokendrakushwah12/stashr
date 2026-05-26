import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/teams/invitations - pending team invites for the current user (by email)
export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { TeamMember, Team } = await registerModels();

  const pending = await TeamMember.find({
    email: session.user.email.toLowerCase(),
    status: "pending",
  })
    .lean()
    .exec();

  if (pending.length === 0) return NextResponse.json({ invitations: [] });

  const teamIds = pending.map((m) => m.teamId);
  const teams = await Team.find({ _id: { $in: teamIds } })
    .lean()
    .exec();
  const teamMap = new Map(teams.map((t) => [String(t._id), t]));

  const invitations = pending
    .map((m) => {
      const team = teamMap.get(String(m.teamId));
      if (!team) return null;
      return {
        id: String(m._id),
        teamId: String(team._id),
        teamName: team.name,
        teamLogoUrl: team.logoUrl,
        role: m.role,
        invitedByName: m.invitedByName,
        invitedAt: m.invitedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return NextResponse.json({ invitations });
}
