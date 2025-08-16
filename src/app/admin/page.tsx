"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAnalytics, useAdminCheck, useAdminStats, useAdminUsers } from '@/lib/hooks/use-admin';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bookmark,
    Eye,
    FolderClosed,
    Loader,
    RefreshCw,
    Shield,
    TrendingUp,
    Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const { data: adminCheck, isLoading: adminCheckLoading } = useAdminCheck();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');

    // Check if user is admin
    useEffect(() => {
        if (status === "authenticated" && adminCheck && !adminCheck.isAdmin) {
            router.push('/');
        }
    }, [session, status, adminCheck, router]);

    // Redirect if not authenticated
    if (status === "unauthenticated") {
        router.push("/auth/signin");
        return null;
    }

    // Show loading while checking authentication and admin status
    if (status === "loading" || adminCheckLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Check if user is admin
    if (adminCheck && !adminCheck.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-[86rem] px-5 mx-auto space-y-8 pt-24 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
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
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <Button
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('overview')}
                >
                    <Eye className="h-4 w-4" />
                    Overview
                </Button>
                <Button
                    variant={activeTab === 'users' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('users')}
                >
                    <Users className="h-4 w-4" />
                    Users
                </Button>
                <Button
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('analytics')}
                >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                </Button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
        </section>
    );
}

// Overview Tab Component
function OverviewTab() {
    const { data: stats, isLoading, error, refetch } = useAdminStats();

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
                    title="Total Users"
                    value={statsData?.totalUsers?.toString() ?? "0"}
                    icon={Users}
                    description="Registered users"
                    trend={statsData?.growth?.users ?? "+0%"}
                    trendUp={true}
                />
                <StatsCard
                    title="Total Folders"
                    value={statsData?.totalFolders?.toString() ?? "0"}
                    icon={FolderClosed}
                    description="Created folders"
                    trend={statsData?.growth?.folders ?? "+0%"}
                    trendUp={true}
                />
                <StatsCard
                    title="Total Bookmarks"
                    value={statsData?.totalBookmarks?.toString() ?? "0"}
                    icon={Bookmark}
                    description="Saved bookmarks"
                    trend={statsData?.growth?.bookmarks ?? "+0%"}
                    trendUp={true}
                />
                <StatsCard
                    title="Active Users"
                    value={statsData?.activeUsers?.toString() ?? "0"}
                    icon={Activity}
                    description="Last 30 days"
                    trend={statsData?.growth?.activeUsers ?? "+0%"}
                    trendUp={true}
                />
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity (Last 7 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-semibold">New Folders</p>
                                <p className="text-sm text-muted-foreground">Created in the last 7 days</p>
                            </div>
                            <div className="text-2xl font-bold">{statsData?.recentActivity?.folders ?? 0}</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-semibold">New Bookmarks</p>
                                <p className="text-sm text-muted-foreground">Added in the last 7 days</p>
                            </div>
                            <div className="text-2xl font-bold">{statsData?.recentActivity?.bookmarks ?? 0}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
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
            <Card>
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
                                <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
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
                                            <p className="text-xs text-muted-foreground">
                                                Last active: {new Date(user.lastActivity).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-2 py-1 rounded text-xs ${user.daysSinceLastActivity <= 7 ? 'bg-green-100 text-green-800' :
                                            user.daysSinceLastActivity <= 30 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
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

// Analytics Tab Component
function AnalyticsTab() {
    const { data: analytics, isLoading, error, refetch } = useAdminAnalytics();

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
                <p className="text-destructive mb-4">Failed to load analytics</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    const analyticsData = analytics;

    return (
        <div className="space-y-6">
            {/* User Engagement */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        User Engagement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="font-semibold">7-Day Engagement</p>
                            <p className="text-2xl font-bold">{analyticsData?.userEngagement?.engagementRate7d?.toFixed(1) ?? 0}%</p>
                            <p className="text-sm text-muted-foreground">
                                {analyticsData?.userEngagement?.activeUsers7d ?? 0} active users
                            </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="font-semibold">30-Day Engagement</p>
                            <p className="text-2xl font-bold">{analyticsData?.userEngagement?.engagementRate30d?.toFixed(1) ?? 0}%</p>
                            <p className="text-sm text-muted-foreground">
                                {analyticsData?.userEngagement?.activeUsers30d ?? 0} active users
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Popular Domains */}
            <Card>
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
                            {analyticsData?.popularDomains?.slice(0, 10).map((domain, index) => (
                                <div key={domain._id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Platform Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="font-semibold">Average Folders per User</p>
                            <p className="text-2xl font-bold">{analyticsData?.summary?.averageFoldersPerUser?.toFixed(1) ?? 0}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="font-semibold">Average Bookmarks per User</p>
                            <p className="text-2xl font-bold">{analyticsData?.summary?.averageBookmarksPerUser?.toFixed(1) ?? 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Stats Card Component
function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendUp
}: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    trend: string;
    trendUp: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                <div className={`flex items-center text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${!trendUp ? 'rotate-180' : ''}`} />
                    {trend}
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