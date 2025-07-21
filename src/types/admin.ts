// Admin response types
export interface AdminCheckResponse {
  isAdmin: boolean;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  error?: string;
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalFolders: number;
  totalBookmarks: number;
  activeUsers: number;
  recentActivity: {
    folders: number;
    bookmarks: number;
  };
  growth: {
    users: string;
    folders: string;
    bookmarks: string;
    activeUsers: string;
  };
  topUsers: {
    byFolders: Array<{
      _id: string;
      folderCount: number;
      lastActivity: string;
    }>;
    byBookmarks: Array<{
      _id: string;
      bookmarkCount: number;
      lastActivity: string;
    }>;
  };
}

export interface AdminUsersResponse {
  users: Array<{
    userId: string;
    userDetails: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    folderCount: number;
    totalBookmarks: number;
    uniqueDomains: number;
    firstActivity: string;
    lastActivity: string;
    lastBookmarkCreated?: string | null;
    daysSinceLastActivity: number;
    activityScore: number;
    folders: Array<{
      _id: string;
      name: string;
      color: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
}

export interface AdminAnalyticsResponse {
  dailyActivity: {
    folders: Array<{ _id: string; count: number }>;
    bookmarks: Array<{ _id: string; count: number }>;
  };
  popularDomains: Array<{ _id: string; count: number }>;
  userEngagement: {
    activeUsers7d: number;
    activeUsers30d: number;
    totalUsers: number;
    engagementRate7d: number;
    engagementRate30d: number;
  };
  contentTrends: {
    weeklyFolders: Array<{ _id: number; count: number }>;
    weeklyBookmarks: Array<{ _id: number; count: number }>;
  };
  summary: {
    totalUsers: number;
    totalFolders: number;
    totalBookmarks: number;
    averageFoldersPerUser: number;
    averageBookmarksPerUser: number;
  };
} 