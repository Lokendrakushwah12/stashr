import Sidebar from "@/components/layouts/sidebar";
import DashboardBreadcrumb from "@/components/layouts/DashboardBreadcrumb";
import { SidebarProvider } from "@/lib/contexts/sidebar-context";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row h-screen bg-background">
        {/* Sidebar - Responsive */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0 border bg-accent/30 rounded-lg mt-3 md:mr-2 md:ml-0 mb-2 mx-2">
          <div className="p-4">
            <DashboardBreadcrumb />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
