"use client";

import ProfileMobileNav from "@/components/profile/ProfileMobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Logout2 } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { LogOut, Monitor, Moon, Palette, Save, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [appearance, setAppearance] = useState({
    theme: "system",
    fontSize: "medium",
    density: "comfortable",
    animations: true,
    reducedMotion: false,
  });

  useEffect(() => {
    if (theme) {
      setAppearance((prev) => ({ ...prev, theme }));
    }
  }, [theme]);

  const handleLogout = async () => {
    void signOut({ callbackUrl: "/auth/signin" });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setAppearance({ ...appearance, theme: newTheme });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Appearance</h1>
          <p className="text-muted-foreground">
            Customize the look and feel of your application
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
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  appearance.theme === "light"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5" />
                  <div>
                    <Label className="text-sm font-medium">Light</Label>
                    <p className="text-muted-foreground text-xs">
                      Clean and bright interface
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  appearance.theme === "dark"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5" />
                  <div>
                    <Label className="text-sm font-medium">Dark</Label>
                    <p className="text-muted-foreground text-xs">
                      Easy on the eyes
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  appearance.theme === "system"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleThemeChange("system")}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5" />
                  <div>
                    <Label className="text-sm font-medium">System</Label>
                    <p className="text-muted-foreground text-xs">
                      Match your system
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <select
                id="fontSize"
                disabled
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="density">Interface Density</Label>
              <select
                id="density"
                disabled
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable animations</Label>
                <p className="text-muted-foreground text-sm">
                  Show smooth transitions and animations
                </p>
              </div>
              <input
                type="checkbox"
                disabled
                className="border-input bg-background text-primary focus:ring-ring h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduce motion</Label>
                <p className="text-muted-foreground text-sm">
                  Minimize animations for accessibility
                </p>
              </div>
              <input
                type="checkbox"
                disabled
                className="border-input bg-background text-primary focus:ring-ring h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
