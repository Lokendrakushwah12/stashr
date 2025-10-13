"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAnalytics, useAdminStats, useAdminStatus, useAdminUsers } from '@/lib/hooks/use-admin';
import { ActivityIcon, BookmarkIcon, FolderIcon, UsersIcon, type IconProps } from "@phosphor-icons/react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bookmark,
    Loader,
    RefreshCw,
    Shield,
    Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const { isAdmin } = useAdminStatus();
    const router = useRouter();

    // Check if user is admin
    useEffect(() => {
        if (status === "authenticated" && !isAdmin) {
            router.push('/');
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Check if user is admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-[86rem] mx-auto space-y-8 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display tracking-tight flex items-center gap-2">
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
                <TabsList className="grid w-fit grid-cols-3 mb-4">
                    <TabsTrigger value="analytics">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        <Users className="h-4 w-4" />
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
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <p className="text-destructive mb-4">Failed to load statistics</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    const statsData = stats;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    value={statsData?.totalUsers?.toString() ?? "0"}
                    icon={UsersIcon}
                    description="Total users"
                />
                <StatsCard
                    value={statsData?.totalFolders?.toString() ?? "0"}
                    icon={FolderIcon}
                    description="Total folders"
                />
                <StatsCard
                    value={statsData?.totalBookmarks?.toString() ?? "0"}
                    icon={BookmarkIcon}
                    description="Total bookmarks"
                />
                <StatsCard
                    value={statsData?.activeUsers?.toString() ?? "0"}
                    icon={ActivityIcon}
                    description="Active users"
                />
            </div>

            <div className="space-y-6">
                {/* User Engagement */}
                <Card className="border relative rounded-2xl bg-secondary/20 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            User Engagement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-secondary dark:bg-secondary/50">
                                <p className="font-semibold">7-Day Engagement</p>
                                <p className="text-2xl font-semibold">{analyticsData?.userEngagement?.engagementRate7d?.toFixed(1) ?? 0}%</p>
                                <p className="text-sm text-muted-foreground">
                                    {analyticsData?.userEngagement?.activeUsers7d ?? 0} active users
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary dark:bg-secondary/50">
                                <p className="font-semibold">30-Day Engagement</p>
                                <p className="text-2xl font-semibold">{analyticsData?.userEngagement?.engagementRate30d?.toFixed(1) ?? 0}%</p>
                                <p className="text-sm text-muted-foreground">
                                    {analyticsData?.userEngagement?.activeUsers30d ?? 0} active users
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Popular Domains */}
                <Card className="border relative rounded-2xl bg-secondary/20 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bookmark className="h-5 w-5" />
                            Popular Domains
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analyticsData?.popularDomains?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bookmark className="h-12 w-12 mx-auto mb-4" />
                                <p>No domain data available</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {analyticsData?.popularDomains?.slice(0, 5).map((domain, index) => (
                                    <div key={domain._id} className="flex items-center justify-between p-2 rounded-lg bg-secondary dark:bg-secondary/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded-sm">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{domain._id}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{domain.count} bookmarks</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card className="border relative rounded-2xl bg-secondary/20 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Platform Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-secondary dark:bg-secondary/50">
                                <p className="font-semibold">Average Folders per User</p>
                                <p className="text-2xl font-semibold">{analyticsData?.summary?.averageFoldersPerUser?.toFixed(1) ?? 0}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary dark:bg-secondary/50">
                                <p className="font-semibold">Average Bookmarks per User</p>
                                <p className="text-2xl font-semibold">{analyticsData?.summary?.averageBookmarksPerUser?.toFixed(1) ?? 0}</p>
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
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <p className="text-destructive mb-4">Failed to load users</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    const users = usersData?.users ?? [];

    return (
        <div className="space-y-6">
            <Card className="border relative rounded-2xl bg-secondary/20 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Statistics ({users.length} users)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.userId} className="flex items-center justify-between p-2 px-4 rounded-2xl bg-secondary dark:bg-secondary/50">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 rounded-lg">
                                            <AvatarImage src={user.userDetails?.image ?? undefined} alt={user.userDetails?.name ?? 'User'} />
                                            <AvatarFallback>
                                                {user.userDetails?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.userDetails?.name ?? `User ${user.userId.slice(-6)}`}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.userDetails?.email ?? `user-${user.userId.slice(-6)}@example.com`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Folders: {user.folderCount} | Bookmarks: {user.totalBookmarks} |
                                                Activity Score: {user.activityScore}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Last active: {new Date(user.lastActivity).toLocaleDateString()}
                                        </p>
                                        <div className={`px-2 py-1 w-fit font-mono uppercase rounded-sm text-xs ${user.daysSinceLastActivity <= 7 ? 'bg-green-600/10 text-green-600' :
                                            user.daysSinceLastActivity <= 30 ? 'bg-yellow-600/10 text-yellow-600' :
                                                'bg-rose-600/10 text-rose-600'
                                            }`}>
                                            {user.daysSinceLastActivity <= 7 ? 'Active' :
                                                user.daysSinceLastActivity <= 30 ? 'Recent' : 'Inactive'}
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
    icon: React.ComponentType<IconProps>;
    description: string;
}) {
    return (
        <Card className="border flex relative rounded-2xl bg-secondary/20 overflow-hidden">
            <CardContent className="w-full flex justify-between p-0">
                <div className="flex flex-col w-full justify-center items-start p-4">
                    <div className="text-3xl font-semibold">{value}</div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex flex-col justify-center items-center px-9 h-full bg-muted/30 bg-lines-diag">
                    <Icon weight="duotone" strokeWidth={1} className="size-10 text-muted-foreground" />
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
                <Loader className="h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }

    if (error) {
        return (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
                Retry
            </Button>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
        </Button>
    );
} 