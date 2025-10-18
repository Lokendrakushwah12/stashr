"use client";

import ProfileMobileNav from "@/components/profile/ProfileMobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogOut, Mail, Monitor, Save, Smartphone } from "lucide-react";
import { signOut } from "next-auth/react";

export default function NotificationsPage() {

  const handleLogout = async () => {
    void signOut({ callbackUrl: "/auth/signin" });
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
              <Switch disabled />
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New bookmarks</Label>
                  <p className="text-muted-foreground text-sm">
                    When you create new bookmarks
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New collaborations</Label>
                  <p className="text-muted-foreground text-sm">
                    When someone invites you to collaborate
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly digest</Label>
                  <p className="text-muted-foreground text-sm">
                    Weekly summary of your activity
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security alerts</Label>
                  <p className="text-muted-foreground text-sm">
                    Important security-related notifications
                  </p>
                </div>
                <Switch disabled />
              </div>
            </div>
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
              <Switch disabled />
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New bookmarks</Label>
                  <p className="text-muted-foreground text-sm">
                    When you create new bookmarks
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New collaborations</Label>
                  <p className="text-muted-foreground text-sm">
                    When someone invites you to collaborate
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mentions</Label>
                  <p className="text-muted-foreground text-sm">
                    When someone mentions you
                  </p>
                </div>
                <Switch disabled />
              </div>
            </div>
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
              <Switch disabled />
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New bookmarks</Label>
                  <p className="text-muted-foreground text-sm">
                    When you create new bookmarks
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New collaborations</Label>
                  <p className="text-muted-foreground text-sm">
                    When someone invites you to collaborate
                  </p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System updates</Label>
                  <p className="text-muted-foreground text-sm">
                    Important system updates and announcements
                  </p>
                </div>
                <Switch disabled />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button disabled>
                <Save className="mr-2 h-4 w-4" />
                Coming Soon
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
