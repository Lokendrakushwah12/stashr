"use client";

import DashboardBreadcrumb from "@/components/layouts/DashboardBreadcrumb";
import { useBookmarkSidebarConfig } from "@/components/layouts/sidebar/configs/bookmarkSidebarConfig";
import { useProfileSidebarConfig } from "@/components/layouts/sidebar/configs/profileSidebarConfig";
import Sidebar from "@/components/layouts/sidebar/Sidebar";
import { UpgradeDialogProvider } from "@/components/upgrade-dialog";
import { SidebarProvider } from "@/lib/contexts/sidebar-context";
import { TeamProvider } from "@/lib/contexts/team-context";
import { usePathname } from "next/navigation";
import React from "react";

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

            <main className="bg-accent/30 mx-2 mt-3 mb-2 flex-1 overflow-auto rounded-lg border pb-16 md:mr-2 md:ml-0 md:pb-0">
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
