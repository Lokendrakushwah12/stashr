"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminAnalytics,
  useAdminStats,
  useAdminStatus,
  useAdminUsers,
} from "@/lib/hooks/use-admin";
import {
  Bookmark,
  Folder,
  PieChart2,
  Refresh,
  Shield,
  ShieldWarning,
  SliderMinimalisticHorizontal,
  UsersGroupTwoRounded,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { isAdmin } = useAdminStatus();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.push("/");
    }
  }, [session, status, isAdmin, router]);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Refresh className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h1 className="mb-2 text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-[86rem] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display flex items-center gap-2 text-3xl tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor user activity and platform statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminStats />
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="analytics" className="w-full" variant="bordered">
        <TabsList className="mb-4 grid w-fit grid-cols-3">
          <TabsTrigger value="analytics">
            <PieChart2 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersGroupTwoRounded className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}

// Overview Tab Component
function AnalyticsTab() {
  const { data: stats, isLoading, error, refetch } = useAdminStats();
  const { data: analyticsData } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Refresh className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <ShieldWarning className="text-destructive mx-auto mb-4 h-12 w-12" />
        <p className="text-destructive mb-4">Failed to load statistics</p>
        <Button onClick={() => refetch()} variant="outline">
          <Refresh className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const statsData = stats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          value={statsData?.totalUsers?.toString() ?? "0"}
          icon={UsersGroupTwoRounded}
          description="Total users"
        />
        <StatsCard
          value={statsData?.totalFolders?.toString() ?? "0"}
          icon={Folder}
          description="Total folders"
        />
        <StatsCard
          value={statsData?.totalBookmarks?.toString() ?? "0"}
          icon={Bookmark}
          description="Total bookmarks"
        />
        <StatsCard
          value={statsData?.activeUsers?.toString() ?? "0"}
          icon={SliderMinimalisticHorizontal}
          description="Active users"
        />
      </div>

      <div className="space-y-6">
        {/* User Engagement */}
        <Card className="bg-secondary/20 relative overflow-hidden rounded-2xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SliderMinimalisticHorizontal className="h-5 w-5" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-secondary dark:bg-secondary/50 rounded-2xl p-4">
                <p className="font-semibold">7-Day Engagement</p>
                <p className="text-2xl font-semibold">
                  {analyticsData?.userEngagement?.engagementRate7d?.toFixed(
                    1,
                  ) ?? 0}
                  %
                </p>
                <p className="text-muted-foreground text-sm">
                  {analyticsData?.userEngagement?.activeUsers7d ?? 0} active
                  users
                </p>
              </div>
              <div className="bg-secondary dark:bg-secondary/50 rounded-2xl p-4">
                <p className="font-semibold">30-Day Engagement</p>
                <p className="text-2xl font-semibold">
                  {analyticsData?.userEngagement?.engagementRate30d?.toFixed(
                    1,
                  ) ?? 0}
                  %
                </p>
                <p className="text-muted-foreground text-sm">
                  {analyticsData?.userEngagement?.activeUsers30d ?? 0} active
                  users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Domains */}
        <Card className="bg-secondary/20 relative overflow-hidden rounded-2xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Popular Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.popularDomains?.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <Bookmark className="mx-auto mb-4 h-12 w-12" />
                <p>No domain data available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {analyticsData?.popularDomains
                  ?.slice(0, 5)
                  .map((domain, index) => (
                    <div
                      key={domain._id}
                      className="bg-secondary dark:bg-secondary/50 flex items-center justify-between rounded-lg p-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-muted rounded-sm px-2 py-1 font-mono text-sm">
                          {index + 1}
                        </span>
                        <span className="font-medium">{domain._id}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {domain.count} bookmarks
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="bg-secondary/20 relative overflow-hidden rounded-2xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart2 className="h-5 w-5" />
              Platform Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-secondary dark:bg-secondary/50 rounded-2xl p-4">
                <p className="font-semibold">Average Folders per User</p>
                <p className="text-2xl font-semibold">
                  {analyticsData?.summary?.averageFoldersPerUser?.toFixed(1) ??
                    0}
                </p>
              </div>
              <div className="bg-secondary dark:bg-secondary/50 rounded-2xl p-4">
                <p className="font-semibold">Average Bookmarks per User</p>
                <p className="text-2xl font-semibold">
                  {analyticsData?.summary?.averageBookmarksPerUser?.toFixed(
                    1,
                  ) ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const { data: usersData, isLoading, error, refetch } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Refresh className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <ShieldWarning className="text-destructive mx-auto mb-4 h-12 w-12" />
        <p className="text-destructive mb-4">Failed to load users</p>
        <Button onClick={() => refetch()} variant="outline">
          <Refresh className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const users = usersData?.users ?? [];

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/20 relative overflow-hidden rounded-2xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersGroupTwoRounded className="h-5 w-5" />
            User Statistics ({users.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <UsersGroupTwoRounded className="mx-auto mb-4 h-12 w-12" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.userId}
                  className="bg-secondary dark:bg-secondary/50 flex items-center justify-between rounded-2xl p-2 px-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage
                        src={user.userDetails?.image ?? undefined}
                        alt={user.userDetails?.name ?? "User"}
                      />
                      <AvatarFallback>
                        {user.userDetails?.name?.charAt(0)?.toUpperCase() ??
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {user.userDetails?.name ??
                          `User ${user.userId.slice(-6)}`}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {user.userDetails?.email ??
                          `user-${user.userId.slice(-6)}@example.com`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Folders: {user.folderCount} | Bookmarks:{" "}
                        {user.totalBookmarks} | Activity Score:{" "}
                        {user.activityScore}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-muted-foreground text-xs">
                      Last active:{" "}
                      {new Date(user.lastActivity).toLocaleDateString()}
                    </p>
                    <div
                      className={`w-fit rounded-sm px-2 py-1 font-mono text-xs uppercase ${
                        user.daysSinceLastActivity <= 7
                          ? "bg-green-600/10 text-green-600"
                          : user.daysSinceLastActivity <= 30
                            ? "bg-yellow-600/10 text-yellow-600"
                            : "bg-rose-600/10 text-rose-600"
                      }`}
                    >
                      {user.daysSinceLastActivity <= 7
                        ? "Active"
                        : user.daysSinceLastActivity <= 30
                          ? "Recent"
                          : "Inactive"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  value,
  icon: Icon,
  description,
}: {
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border p-0">
      <CardContent className="flex w-full justify-between p-0">
        <div className="flex w-full flex-col items-start justify-center p-4">
          <div className="text-3xl font-semibold">{value}</div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="bg-muted/30 bg-lines-diag flex h-full flex-col items-center justify-center px-9">
          <Icon
            weight="duotone"
            strokeWidth={1}
            className="text-muted-foreground size-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Admin Stats Component
function AdminStats() {
  const { isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Refresh className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <Refresh className="h-4 w-4" />
        Retry
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => refetch()}>
      <Refresh className="h-4 w-4" />
      Refresh
    </Button>
  );
}
