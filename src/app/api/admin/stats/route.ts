import { authOptions } from "@/lib/auth";
import { registerModels } from "@/models";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/admin/stats - Get admin statistics
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.userType !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();
    const { Folder, Bookmark } = await registerModels();

    // Get total counts
    const [totalFolders, totalBookmarks] = await Promise.all([
      Folder.countDocuments().exec(),
      Bookmark.countDocuments().exec(),
    ]);

    // Get unique users (from folders)
    const uniqueUsers = await Folder.distinct('userId').exec();
    const totalUsers = uniqueUsers.length;

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await Folder.distinct('userId', {
      updatedAt: { $gte: thirtyDaysAgo }
    }).exec();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFolders = await Folder.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    }).exec();

    const recentBookmarks = await Bookmark.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    }).exec();

    // Calculate growth rates (mock data for now)
    const stats = {
      totalUsers,
      totalFolders,
      totalBookmarks,
      activeUsers: activeUsers.length,
      recentActivity: {
        folders: recentFolders,
        bookmarks: recentBookmarks,
      },
      growth: {
        users: "+12%",
        folders: "+8%",
        bookmarks: "+15%",
        activeUsers: "+5%",
      },
      topUsers: await getTopUsers(),
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin stats:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch admin stats: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}

// Helper function to get top users by activity
async function getTopUsers() {
  const { Folder, Bookmark } = await registerModels();
  
  // Get users with most folders
  const topUsersByFolders = await Folder.aggregate([
    {
      $group: {
        _id: "$userId",
        folderCount: { $sum: 1 },
        lastActivity: { $max: "$updatedAt" }
      }
    },
    {
      $sort: { folderCount: -1 }
    },
    {
      $limit: 5
    }
  ]).exec();

  // Get users with most bookmarks
  const topUsersByBookmarks = await Bookmark.aggregate([
    {
      $group: {
        _id: "$userId",
        bookmarkCount: { $sum: 1 },
        lastActivity: { $max: "$updatedAt" }
      }
    },
    {
      $sort: { bookmarkCount: -1 }
    },
    {
      $limit: 5
    }
  ]).exec();

  return {
    byFolders: topUsersByFolders,
    byBookmarks: topUsersByBookmarks,
  };
} 