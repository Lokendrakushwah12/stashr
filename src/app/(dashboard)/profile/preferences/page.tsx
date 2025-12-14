"use client";

import ProfileMobileNav from "@/components/profile/ProfileMobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Logout2 } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Globe, LogOut, Save, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

export default function PreferencesPage() {
  const handleLogout = async () => {
    void signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Preferences</h1>
          <p className="text-muted-foreground">
            Customize your application experience
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
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  disabled
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  disabled
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select
                  id="dateFormat"
                  disabled
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
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

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save changes</Label>
                <p className="text-muted-foreground text-sm">
                  Automatically save your work as you type
                </p>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show tutorials</Label>
                <p className="text-muted-foreground text-sm">
                  Display helpful tips and tutorials
                </p>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact mode</Label>
                <p className="text-muted-foreground text-sm">
                  Use a more compact interface layout
                </p>
              </div>
              <Switch disabled />
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
                <Logout2 className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
