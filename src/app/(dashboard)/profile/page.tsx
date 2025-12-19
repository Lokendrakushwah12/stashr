"use client";

import ProfileMobileNav from "@/components/profile/ProfileMobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logout2 } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { LogOut, Save, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    if (session?.user?.image) {
      setImage(session.user.image);
    }
  }, [session?.user?.name, session?.user?.image]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ...(image && { image }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session
      await update({
        name: name.trim(),
        ...(image && { image }),
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    setImage(url);
    // Auto-save image when uploaded
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session
      await update({
        name: name.trim(),
        image: url,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageRemove = async () => {
    setImage(null);
    // Auto-save removal
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session
      await update({
        name: name.trim(),
        image: null,
      });
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to remove image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="hidden gap-2 md:flex"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Mobile Navigation - Only visible on mobile */}
      <div className="mt-4 md:hidden">
        <ProfileMobileNav />

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Name */}
              <div className="flex items-center gap-6">
                <ImageUpload
                  currentImage={image ?? session?.user?.image}
                  onUploadComplete={handleImageUpload}
                  onRemove={handleImageRemove}
                  fallbackText={userInitials}
                  size="md"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={session?.user?.email ?? ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-muted-foreground text-xs">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !name.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
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

      {/* Desktop Content - Only visible on desktop */}
      <div className="hidden md:block">
        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Name */}
              <div className="flex items-center gap-6">
                <ImageUpload
                  currentImage={image ?? session?.user?.image}
                  onUploadComplete={handleImageUpload}
                  onRemove={handleImageRemove}
                  fallbackText={userInitials}
                  size="md"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={session?.user?.email ?? ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-muted-foreground text-xs">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !name.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
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
    </div>
  );
}
