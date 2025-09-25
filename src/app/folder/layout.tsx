import Sidebar from "@/components/layouts/sidebar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const FolderLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto border bg-accent/30 rounded-lg mt-3 pt-3">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default FolderLayout;
