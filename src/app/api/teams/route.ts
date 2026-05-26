import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { ensureUserHasTeam, listUserTeams } from "@/lib/team-service";
import { assertWithinLimit, PlanLimitError } from "@/lib/plans";
import { planLimitResponse } from "@/lib/api-team";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/teams - list teams the current user is a member of
export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Backfill: auto-create a default team for EXISTING users with legacy data.
  // Brand-new users will get an empty list and be sent through onboarding.
  await ensureUserHasTeam({
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    userImage: session.user.image,
  });

  const teams = await listUserTeams(session.user.id);
  return NextResponse.json({ teams });
}

// POST /api/teams - create a new team
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string; logoUrl?: string };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const { Team, TeamMember } = await registerModels();

    // Count user's existing OWNED teams to enforce teamsPerUser limit
    const ownedCount = await Team.countDocuments({ ownerId: session.user.id });
    try {
      assertWithinLimit({
        planId: "free",
        key: "teamsPerUser",
        current: ownedCount,
      });
    } catch (e) {
      if (e instanceof PlanLimitError) return planLimitResponse(e);
      throw e;
    }

    const slugBase =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60) || "team";
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const team = await Team.create({
      name,
      slug,
      logoUrl: body.logoUrl?.trim() ?? "",
      ownerId: session.user.id,
      planId: "free",
    });

    await TeamMember.create({
      teamId: team._id,
      userId: session.user.id,
      email: session.user.email.toLowerCase(),
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
      role: "owner",
      status: "active",
      invitedAt: new Date(),
      respondedAt: new Date(),
    });

    return NextResponse.json(
      {
        team: {
          id: String(team._id),
          name: team.name,
          slug: team.slug,
          logoUrl: team.logoUrl,
          planId: team.planId,
          ownerId: team.ownerId,
          role: "owner",
          memberCount: 1,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
