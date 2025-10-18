"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings, Bell, Palette } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Get the current tab value based on pathname
  const getCurrentTab = () => {
    if (pathname === "/profile") return "profile";
    if (pathname === "/profile/security") return "security";
    if (pathname === "/profile/preferences") return "preferences";
    if (pathname === "/profile/notifications") return "notifications";
    if (pathname === "/profile/appearance") return "appearance";
    return "profile";
  };

  const handleTabChange = (value: string) => {
    const routes = {
      profile: "/profile",
      security: "/profile/security",
      preferences: "/profile/preferences",
      notifications: "/profile/notifications",
      appearance: "/profile/appearance",
    };
    
    const route = routes[value as keyof typeof routes];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="md:hidden mb-6">
      <Tabs variant="bordered" defaultValue={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full overflow-x-auto scrollbar-hide">
          <TabsTrigger value="profile" className="flex flex-col gap-1 text-xs">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col gap-1 text-xs">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex flex-col gap-1 text-xs">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col gap-1 text-xs">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col gap-1 text-xs">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
