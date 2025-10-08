"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import AccountPopover from "./AccountPopover";
import type { SidebarProps, SidebarItem as SidebarItemType } from "./types";
import { useSidebar } from "@/lib/contexts/sidebar-context";

export default function Sidebar({ 
  config, 
  className = "", 
  width = "w-80",
  collapsible = true,
  defaultCollapsed = false 
}: SidebarProps) {
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

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
      <div className={cn(
        "bg-background relative flex flex-col h-full items-start transition-all duration-200",
        width,
        className
      )}>
        <div className="p-2 space-y-6 w-full">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "bg-background transition-all relative duration-200 hidden md:flex md:flex-col md:items-start md:h-full",
        width,
        isCollapsed && "md:w-14 md:items-center",
        className
      )}>
        {/* Header */}
        {config.header && (
          <div className="px-3 mt-6.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {config.header.icon && (
                  <config.header.icon className="h-6 w-6 text-primary flex-shrink-0" />
                )}
                {!isCollapsed && (
                  <h2 className="text-lg font-semibold">{config.header.title}</h2>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <ScrollArea className="flex-1 w-full">
          <div className="p-2 space-y-6 w-full">
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
          <div className={cn("p-2 w-full", isCollapsed && "px-1")}>
            <AccountPopover />
          </div>
        )}
      </div>

      {/* Mobile Bottom Sidebar */}
      <div className={cn(
        "bg-background transition-all duration-200 md:hidden flex flex-row items-center h-16 w-full border-t border-border fixed bottom-0 left-0 right-0 z-50",
        className
      )}>
        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-around px-2 bg-background">
          {config.sections.flatMap(section => section.items).map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              isCollapsed={false}
              className="flex-1 max-w-16"
            />
          ))}
        </div>
      </div>
    </>
  );
}
