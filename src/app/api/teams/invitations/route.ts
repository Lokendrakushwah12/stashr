import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/teams/invitations
//   - invitations: team invites addressed to the current user (pending + declined)
//   - declinedNotifications: invites sent by the current user that were declined
export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { TeamMember, Team } = await registerModels();
  const emailLower = session.user.email.toLowerCase();

  const [received, sentDeclined, roleChanges] = await Promise.all([
    TeamMember.find({
      email: emailLower,
      $or: [
        { status: { $in: ["pending", "declined"] } },
        // Active rows only count as "accepted invitations" if they were
        // actually invited by someone — exclude teams the user created
        // themselves (which have no invitedByUserId).
        { status: "active", invitedByUserId: { $exists: true } },
      ],
    })
      .lean()
      .exec(),
    TeamMember.find({
      invitedByUserId: session.user.id,
      status: "declined",
      email: { $ne: emailLower },
      acknowledgedByInviterAt: { $exists: false },
    })
      .lean()
      .exec(),
    TeamMember.find({
      email: emailLower,
      status: "active",
      roleChangedAt: { $exists: true },
      $or: [
        { roleChangeAcknowledgedAt: { $exists: false } },
        { $expr: { $lt: ["$roleChangeAcknowledgedAt", "$roleChangedAt"] } },
      ],
    })
      .lean()
      .exec(),
  ]);

  const teamIds = [
    ...new Set(
      [...received, ...sentDeclined, ...roleChanges].map((m) =>
        String(m.teamId),
      ),
    ),
  ];
  const teams =
    teamIds.length > 0
      ? await Team.find({
          _id: { $in: teamIds.map((id) => id) },
        })
          .lean()
          .exec()
      : [];
  const teamMap = new Map(teams.map((t) => [String(t._id), t]));

  const invitations = received
    .map((m) => {
      const team = teamMap.get(String(m.teamId));
      if (!team) return null;
      const status: "pending" | "declined" | "accepted" =
        m.status === "active"
          ? "accepted"
          : (m.status as "pending" | "declined");
      return {
        id: String(m._id),
        teamId: String(team._id),
        teamName: team.name,
        teamLogoUrl: team.logoUrl,
        role: m.role,
        status,
        invitedByName: m.invitedByName,
        invitedAt: m.invitedAt,
        respondedAt: m.respondedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const declinedNotifications = sentDeclined
    .map((m) => {
      const team = teamMap.get(String(m.teamId));
      if (!team) return null;
      return {
        id: String(m._id),
        teamId: String(team._id),
        teamName: team.name,
        teamLogoUrl: team.logoUrl,
        role: m.role,
        invitedEmail: m.email,
        invitedName: m.name ?? null,
        respondedAt: m.respondedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const roleChangeNotifications = roleChanges
    .map((m) => {
      const team = teamMap.get(String(m.teamId));
      if (!team) return null;
      return {
        id: String(m._id),
        teamId: String(team._id),
        teamName: team.name,
        teamLogoUrl: team.logoUrl,
        previousRole: m.previousRole ?? null,
        newRole: m.role,
        changedByName: m.roleChangedByName ?? null,
        changedAt: m.roleChangedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return NextResponse.json({
    invitations,
    declinedNotifications,
    roleChangeNotifications,
  });
}
