import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { registerModels } from "@/models";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/admin/analytics - Get detailed analytics data
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

    // Get analytics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Daily activity for the last 30 days
    const dailyActivity = await getDailyActivity(thirtyDaysAgo);

    // Popular domains
    const popularDomains = await getPopularDomains();

    // User engagement metrics
    const userEngagement = await getUserEngagement();

    // Content creation trends
    const contentTrends = await getContentTrends(thirtyDaysAgo);

    const analytics = {
      dailyActivity,
      popularDomains,
      userEngagement,
      contentTrends,
      summary: {
        totalUsers: await Folder.distinct('userId').exec().then(users => users.length),
        totalFolders: await Folder.countDocuments().exec(),
        totalBookmarks: await Bookmark.countDocuments().exec(),
        averageFoldersPerUser: await getAverageFoldersPerUser(),
        averageBookmarksPerUser: await getAverageBookmarksPerUser(),
      }
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch admin analytics: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch admin analytics" },
      { status: 500 },
    );
  }
}

// Helper function to get daily activity
async function getDailyActivity(startDate: Date) {
  const { Folder, Bookmark } = await registerModels();
  
  const dailyFolders = await Folder.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]).exec();

  const dailyBookmarks = await Bookmark.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]).exec();

  return {
    folders: dailyFolders as Array<{ _id: string; count: number }>,
    bookmarks: dailyBookmarks as Array<{ _id: string; count: number }>,
  };
}

// Helper function to get popular domains
async function getPopularDomains() {
  const { Bookmark } = await registerModels();
  
  const domainStats = await Bookmark.aggregate([
    {
      $addFields: {
        domain: {
          $substr: [
            {
              $replaceAll: {
                input: "$url",
                find: "https://",
                replacement: ""
              }
            },
            0,
            {
              $indexOfBytes: [
                {
                  $replaceAll: {
                    input: "$url",
                    find: "https://",
                    replacement: ""
                  }
                },
                "/"
              ]
            }
          ]
        }
      }
    },
    {
      $group: {
        _id: "$domain",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]).exec();

  return domainStats as Array<{ _id: string; count: number }>;
}

// Helper function to get user engagement
async function getUserEngagement() {
  const { Folder } = await registerModels();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [activeUsers7d, activeUsers30d, totalUsers] = await Promise.all([
    Folder.distinct('userId', { updatedAt: { $gte: sevenDaysAgo } }).exec(),
    Folder.distinct('userId', { updatedAt: { $gte: thirtyDaysAgo } }).exec(),
    Folder.distinct('userId').exec(),
  ]);

  return {
    activeUsers7d: activeUsers7d.length,
    activeUsers30d: activeUsers30d.length,
    totalUsers: totalUsers.length,
    engagementRate7d: totalUsers.length > 0 ? (activeUsers7d.length / totalUsers.length) * 100 : 0,
    engagementRate30d: totalUsers.length > 0 ? (activeUsers30d.length / totalUsers.length) * 100 : 0,
  };
}

// Helper function to get content trends
async function getContentTrends(startDate: Date) {
  const { Folder, Bookmark } = await registerModels();
  
  const weeklyFolders = await Folder.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: { $week: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]).exec();

  const weeklyBookmarks = await Bookmark.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: { $week: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]).exec();

  return {
    weeklyFolders,
    weeklyBookmarks,
  };
}

// Helper function to get average folders per user
async function getAverageFoldersPerUser() {
  const { Folder } = await registerModels();
  
  const result = await Folder.aggregate([
    {
      $group: {
        _id: "$userId",
        folderCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        averageFolders: { $avg: "$folderCount" }
      }
    }
  ]).exec();

  return (result[0] as { averageFolders: number } | undefined)?.averageFolders ?? 0;
}

// Helper function to get average bookmarks per user
async function getAverageBookmarksPerUser() {
  const { Bookmark } = await registerModels();
  
  const result = await Bookmark.aggregate([
    {
      $group: {
        _id: "$userId",
        bookmarkCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        averageBookmarks: { $avg: "$bookmarkCount" }
      }
    }
  ]).exec();

  return (result[0] as { averageBookmarks: number } | undefined)?.averageBookmarks ?? 0;
} 