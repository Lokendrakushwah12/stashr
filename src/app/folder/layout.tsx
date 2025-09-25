import Sidebar from "@/components/layouts/sidebar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const FolderLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Sidebar - Responsive */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0 border bg-accent/30 rounded-lg mt-3 pt-3 md:mr-2 md:ml-0 mb-2 mx-2">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default FolderLayout;
