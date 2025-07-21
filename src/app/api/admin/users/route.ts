import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb-adapter";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Types for MongoDB aggregation results
interface UserStats {
  _id: string;
  folderCount: number;
  totalBookmarks: number;
  firstActivity: string;
  lastActivity: string;
  folders: Array<{
    _id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface BookmarkStats {
  _id: string | null;
  totalBookmarks: number;
  uniqueDomains: string[];
  lastBookmarkCreated: string | null;
}

interface UserDoc {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
}

// GET /api/admin/users - Get all users with their statistics
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.email !== "lokendrakushwah8051@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { Folder, Bookmark } = await registerModels();

    // Get MongoDB client to access NextAuth users collection
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Get all unique users with their statistics
    const usersWithStats = await Folder.aggregate([
      {
        $group: {
          _id: "$userId",
          folderCount: { $sum: 1 },
          totalBookmarks: { $sum: { $size: "$bookmarks" } },
          firstActivity: { $min: "$createdAt" },
          lastActivity: { $max: "$updatedAt" },
          folders: {
            $push: {
              _id: "$_id",
              name: "$name",
              color: "$color",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $sort: { lastActivity: -1 },
      },
    ]).exec() as UserStats[];

    // Get additional bookmark statistics for each user and fetch user details
    const usersWithDetailedStats = await Promise.all(
      usersWithStats.map(async (user) => {
        const bookmarkStats = await Bookmark.aggregate([
          {
            $match: { userId: user._id },
          },
          {
            $group: {
              _id: null,
              totalBookmarks: { $sum: 1 },
              uniqueDomains: { $addToSet: { $substr: ["$url", 0, 50] } },
              lastBookmarkCreated: { $max: "$createdAt" },
            },
          },
        ]).exec() as BookmarkStats[];

        const bookmarkCount = bookmarkStats[0]?.totalBookmarks ?? 0;
        const uniqueDomains = bookmarkStats[0]?.uniqueDomains?.length ?? 0;
        const lastBookmarkCreated = bookmarkStats[0]?.lastBookmarkCreated ?? null;

        // Calculate user activity score
        const daysSinceLastActivity = lastBookmarkCreated
          ? Math.floor(
              (Date.now() - new Date(lastBookmarkCreated).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : Infinity;

        const activityScore = calculateActivityScore(
          user.folderCount,
          bookmarkCount,
          daysSinceLastActivity,
        );

        // Get user details from NextAuth users collection
        const userDoc = await usersCollection.findOne({ _id: new ObjectId(user._id) }) as UserDoc | null;
        const userDetails = {
          id: user._id,
          name: userDoc?.name ?? `User ${user._id.slice(-6)}`,
          email: userDoc?.email ?? `user-${user._id.slice(-6)}@example.com`,
          image: userDoc?.image ?? null,
        };

        return {
          userId: user._id,
          userDetails,
          folderCount: user.folderCount,
          totalBookmarks: bookmarkCount,
          uniqueDomains,
          firstActivity: user.firstActivity,
          lastActivity: user.lastActivity,
          lastBookmarkCreated,
          daysSinceLastActivity,
          activityScore,
          folders: user.folders,
        };
      }),
    );

    return NextResponse.json(
      { users: usersWithDetailedStats },
      { status: 200 },
    );
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
