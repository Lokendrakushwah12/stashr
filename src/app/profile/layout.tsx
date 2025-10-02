"use client";

import Sidebar from "@/components/layouts/sidebar/Sidebar";
import { useProfileSidebarConfig } from "@/components/layouts/sidebar/configs/profileSidebarConfig";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = useProfileSidebarConfig();

  return (
    <div className="bg-background flex h-screen flex-col md:flex-row">
      <Sidebar config={config} className="" width="w-54" collapsible={false} />

      {/* Main Content */}
      <main className="bg-accent/30 mx-2 mt-3 mb-2 flex-1 overflow-auto rounded-lg border pt-3 pb-16 md:mr-2 md:ml-0 md:pb-0">
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-center h-full">
                <div className="text-3xl text-foreground tracking-tight font-medium">
                    In Progress, come back later...
                </div>
            </div>
          {/* {children} */}
        </div>
      </main>
    </div>
  );
}
