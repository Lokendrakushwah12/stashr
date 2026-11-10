import { authOptions } from "@/lib/auth";
import { daysSince, listUserActivity } from "@/lib/user-activity";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/admin/users - Get all users with their statistics
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.userType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = (await listUserActivity())
      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
      .map((u) => {
        const daysSinceLastActivity = daysSince(u.lastActivityAt);
        return {
          userId: u.id,
          userDetails: {
            id: u.id,
            name: u.name ?? `User ${u.id.slice(-6)}`,
            email: u.email ?? "",
            image: u.image ?? null,
          },
          folderCount: u.folderCount,
          totalBookmarks: u.bookmarkCount,
          uniqueDomains: u.uniqueDomains,
          firstActivity: u.signupAt.toISOString(),
          lastActivity: u.lastActivityAt.toISOString(),
          daysSinceLastActivity,
          activityScore: calculateActivityScore(
            u.folderCount,
            u.bookmarkCount,
            daysSinceLastActivity,
          ),
        };
      });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin users:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch admin users: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 },
    );
  }
}

// Helper function to calculate user activity score
function calculateActivityScore(
  folderCount: number,
  bookmarkCount: number,
  daysSinceLastActivity: number,
): number {
  // Base score from content creation
  let score = folderCount * 10 + bookmarkCount * 2;

  // Penalty for inactivity
  if (daysSinceLastActivity <= 1) {
    score += 50; // Very active
  } else if (daysSinceLastActivity <= 7) {
    score += 30; // Active
  } else if (daysSinceLastActivity <= 30) {
    score += 10; // Somewhat active
  } else if (daysSinceLastActivity <= 90) {
    score -= 20; // Inactive
  } else {
    score -= 50; // Very inactive
  }

  return Math.max(0, score);
}
