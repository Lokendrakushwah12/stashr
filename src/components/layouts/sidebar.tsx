"use client";

import Sidebar from "./sidebar/Sidebar";
import { useBookmarkSidebarConfig } from "./sidebar/configs/bookmarkSidebarConfig";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  className?: string;
}

export default function BookmarkSidebar({ className = "" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useBookmarkSidebarConfig({
    onNavigate: (path: string) => router.push(path),
    currentPath: pathname,
  });

  return (
    <Sidebar 
      config={config} 
      className={className}
      width="w-54"
      collapsible={false}
    />
  );
}