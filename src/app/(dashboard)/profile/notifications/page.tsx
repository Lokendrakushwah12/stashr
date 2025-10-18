"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, Save, LogOut, Mail, Smartphone, Monitor } from "lucide-react";
import ProfileMobileNav from "@/components/profile/ProfileMobileNav";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      newBookmarks: true,
      newCollaborations: true,
      weeklyDigest: true,
      securityAlerts: true,
    },
    push: {
      enabled: true,
      newBookmarks: false,
      newCollaborations: true,
      mentions: true,
    },
    inApp: {
      enabled: true,
      newBookmarks: true,
      newCollaborations: true,
      systemUpdates: true,
    },
  });

  useEffect(() => {
    // Load notification preferences from API
    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/user/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };
    loadNotifications();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification settings");
      }

      toast.success("Notification settings updated successfully");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const updateNotification = (category: string, key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="hidden gap-2 md:flex"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <ProfileMobileNav />

      <div className="grid gap-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable email notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={notifications.email.enabled}
                onCheckedChange={(checked) =>
                  updateNotification("email", "enabled", checked)
                }
              />
            </div>

            {notifications.email.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New bookmarks</Label>
                    <p className="text-muted-foreground text-sm">
                      When you create new bookmarks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.newBookmarks}
                    onCheckedChange={(checked) =>
                      updateNotification("email", "newBookmarks", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New collaborations</Label>
                    <p className="text-muted-foreground text-sm">
                      When someone invites you to collaborate
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.newCollaborations}
                    onCheckedChange={(checked) =>
                      updateNotification("email", "newCollaborations", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly digest</Label>
                    <p className="text-muted-foreground text-sm">
                      Weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.weeklyDigest}
                    onCheckedChange={(checked) =>
                      updateNotification("email", "weeklyDigest", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security alerts</Label>
                    <p className="text-muted-foreground text-sm">
                      Important security-related notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.securityAlerts}
                    onCheckedChange={(checked) =>
                      updateNotification("email", "securityAlerts", checked)
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable push notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Receive notifications on your device
                </p>
              </div>
              <Switch
                checked={notifications.push.enabled}
                onCheckedChange={(checked) =>
                  updateNotification("push", "enabled", checked)
                }
              />
            </div>

            {notifications.push.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New bookmarks</Label>
                    <p className="text-muted-foreground text-sm">
                      When you create new bookmarks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.newBookmarks}
                    onCheckedChange={(checked) =>
                      updateNotification("push", "newBookmarks", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New collaborations</Label>
                    <p className="text-muted-foreground text-sm">
                      When someone invites you to collaborate
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.newCollaborations}
                    onCheckedChange={(checked) =>
                      updateNotification("push", "newCollaborations", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mentions</Label>
                    <p className="text-muted-foreground text-sm">
                      When someone mentions you
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.mentions}
                    onCheckedChange={(checked) =>
                      updateNotification("push", "mentions", checked)
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              In-App Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable in-app notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Show notifications within the application
                </p>
              </div>
              <Switch
                checked={notifications.inApp.enabled}
                onCheckedChange={(checked) =>
                  updateNotification("inApp", "enabled", checked)
                }
              />
            </div>

            {notifications.inApp.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New bookmarks</Label>
                    <p className="text-muted-foreground text-sm">
                      When you create new bookmarks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.newBookmarks}
                    onCheckedChange={(checked) =>
                      updateNotification("inApp", "newBookmarks", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New collaborations</Label>
                    <p className="text-muted-foreground text-sm">
                      When someone invites you to collaborate
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.newCollaborations}
                    onCheckedChange={(checked) =>
                      updateNotification("inApp", "newCollaborations", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System updates</Label>
                    <p className="text-muted-foreground text-sm">
                      Important system updates and announcements
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.systemUpdates}
                    onCheckedChange={(checked) =>
                      updateNotification("inApp", "systemUpdates", checked)
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-destructive/20 flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-muted-foreground text-sm">
                  Sign out from your account on this device
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
