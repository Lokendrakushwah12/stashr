"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/lib/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import {
  BookmarkSquare,
  ClipboardText,
  InboxLine,
  User,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccountPopover from "./AccountPopover";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import type { SidebarItem as SidebarItemType, SidebarProps } from "./types";

export default function Sidebar({
  config,
  className = "",
  width = "w-80",
}: SidebarProps) {
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleItemClick = (item: SidebarItemType) => {
    if (item.href) {
      router.push(item.href);
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          "bg-background relative flex h-full flex-col items-start transition-all duration-200",
          width,
          className,
        )}
      >
        <div className="w-full space-y-6 p-2">
          <div className="animate-pulse space-y-2">
            <div className="bg-muted h-8 rounded" />
            <div className="bg-muted h-8 rounded" />
            <div className="bg-muted h-8 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "bg-background relative hidden transition-all duration-200 md:flex md:h-full md:flex-col md:items-start",
          width,
          isCollapsed && "md:w-14 md:items-center",
          className,
        )}
      >
        {/* Header */}
        {config.header && (
          <div className="mt-6.5 px-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {config.header.icon && (
                  <config.header.icon className="text-primary h-6 w-6 shrink-0" />
                )}
                {!isCollapsed && (
                  <h2 className="text-lg font-semibold">
                    {config.header.title}
                  </h2>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <ScrollArea className="w-full flex-1">
          <div className="w-full space-y-6 p-2">
            {config.sections.map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                onItemClick={handleItemClick}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Account Section */}
        {config.account?.showAccountInfo && (
          <div className={cn("w-full p-2", isCollapsed && "px-1")}>
            <AccountPopover />
          </div>
        )}
      </div>

      {/* Mobile Bottom Sidebar */}
      <div
        className={cn(
          "bg-background border-border fixed right-0 bottom-0 left-0 z-50 flex h-16 w-full flex-row items-center border-t transition-all duration-200 md:hidden",
          className,
        )}
      >
        {/* Mobile Navigation - Always show main navigation items */}
        <div className="bg-background flex flex-1 items-center justify-around px-2">
          {/* Main navigation items - always visible on mobile */}
          <SidebarItem
            key="board"
            item={{
              id: "board",
              label: "Boards",
              icon: ClipboardText,
              href: "/board",
              active: pathname === "/board",
            }}
            onClick={() => router.push("/board")}
            isCollapsed={false}
            className="flex size-10"
          />
          <SidebarItem
            key="bookmarks"
            item={{
              id: "bookmarks",
              label: "Bookmarks",
              icon: BookmarkSquare,
              href: "/bookmarks",
              active: pathname === "/bookmarks",
            }}
            onClick={() => router.push("/bookmarks")}
            isCollapsed={false}
            className="flex size-10"
          />
          <SidebarItem
            key="inbox"
            item={{
              id: "inbox",
              label: "Inbox",
              icon: InboxLine,
              href: "/inbox",
              active: pathname === "/inbox",
            }}
            onClick={() => router.push("/inbox")}
            isCollapsed={false}
            className="flex size-10"
          />
          <SidebarItem
            key="profile"
            item={{
              id: "profile",
              label: "Profile",
              icon: User,
              href: "/profile",
              active: pathname === "/profile",
            }}
            onClick={() => router.push("/profile")}
            isCollapsed={false}
            className="flex size-10"
          />
        </div>
      </div>
    </>
  );
}
