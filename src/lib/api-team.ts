import "server-only";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveCurrentTeam, NoTeamError } from "@/lib/team-service";
import type { TeamRole } from "@/models/TeamMember";
import { PlanLimitError } from "@/lib/plans";

export interface RequestContext {
  userId: string;
  userEmail: string;
  userName?: string | null;
  userImage?: string | null;
  teamId: string;
  role: TeamRole;
}

export async function getRequestContext(
  request: NextRequest,
): Promise<RequestContext | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedTeamId = request.headers.get("x-team-id");

  let teamId: string;
  let role: TeamRole;
  try {
    const resolved = await resolveCurrentTeam({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      userImage: session.user.image,
      requestedTeamId,
    });
    teamId = resolved.teamId;
    role = resolved.role;
  } catch (e) {
    if (e instanceof NoTeamError) {
      return NextResponse.json(
        { error: "No team yet. Create one to continue.", code: "NO_TEAM" },
        { status: 409 },
      );
    }
    throw e;
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    userImage: session.user.image,
    teamId,
    role,
  };
}

export function planLimitResponse(err: PlanLimitError): NextResponse {
  return NextResponse.json(err.toJSON(), { status: 402 });
}
