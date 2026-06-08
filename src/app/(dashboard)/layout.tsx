"use client";

import DashboardBreadcrumb from "@/components/layouts/DashboardBreadcrumb";
import { useBookmarkSidebarConfig } from "@/components/layouts/sidebar/configs/bookmarkSidebarConfig";
import { useProfileSidebarConfig } from "@/components/layouts/sidebar/configs/profileSidebarConfig";
import Sidebar from "@/components/layouts/sidebar/Sidebar";
import { ThemeToggle } from "@/components/layouts/theme-toggle";
import { TeamSwitcher } from "@/components/team/TeamSwitcher";
import { Button } from "@/components/ui/button";
import { UpgradeDialogProvider } from "@/components/upgrade-dialog";
import { SidebarProvider } from "@/lib/contexts/sidebar-context";
import { TeamProvider } from "@/lib/contexts/team-context";
import { Logout2 } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const isProfileRoute = pathname.startsWith("/profile");

  const bookmarkConfig = useBookmarkSidebarConfig({ currentPath: pathname });
  const profileConfig = useProfileSidebarConfig();

  const sidebarConfig = isProfileRoute ? profileConfig : bookmarkConfig.config;

  return (
    <TeamProvider>
      <UpgradeDialogProvider>
        <SidebarProvider>
          <div className="bg-background flex h-screen flex-col md:flex-row">
            <Sidebar
              config={sidebarConfig}
              width={isProfileRoute ? "w-54" : "w-54"}
              collapsible={!isProfileRoute}
            />

            {/* Mobile-only team switcher — on desktop it lives in the sidebar header. */}
            <div className="m-2 mb-0 flex items-center justify-between md:hidden">
              <TeamSwitcher className="w-fit" />
              <ThemeToggle className="size-9 px-2.25" />
            </div>
            <main className="bg-accent/30 mx-2 mt-1 mb-2 flex-1 overflow-auto rounded-lg border pb-16 md:mt-2.5 md:mr-2 md:ml-0 md:pb-0">
              <div className="p-4">
                <DashboardBreadcrumb />
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </UpgradeDialogProvider>
    </TeamProvider>
  );
};

export default DashboardLayout;
