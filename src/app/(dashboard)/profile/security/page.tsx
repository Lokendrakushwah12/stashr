"use client";

import ProfileMobileNav from "@/components/profile/ProfileMobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logout2 } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Eye, EyeOff, Key, LogOut, Save, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/security/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    void signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            Security Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account security and password settings
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
        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter your current password"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled
                >
                  <Eye className="h-4 w-4" />
                </Button>
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

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Enable 2FA</h3>
                <p className="text-muted-foreground text-sm">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" disabled>
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
