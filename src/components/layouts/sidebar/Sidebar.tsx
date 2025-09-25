"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarSection from "./SidebarSection";
import AccountPopover from "./AccountPopover";
import type { SidebarProps, SidebarItem as SidebarItemType } from "./types";
import { SidebarIcon } from "@phosphor-icons/react";

export default function Sidebar({ 
  config, 
  className = "", 
  width = "w-80",
  collapsible = true,
  defaultCollapsed = false 
}: SidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mounted, setMounted] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, mounted]);

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
    <div className={cn(
      "bg-background relative flex flex-col h-full items-start transition-all duration-200",
      width,
      isCollapsed && "w-14 items-center",
      className
    )}>
      {/* Header */}
      {config.header && (
        <div className="px-3 mt-6.5">
          <div className="flex items-center gap-2">
            {config.header.icon && (
              <config.header.icon className="h-6 w-6 text-primary flex-shrink-0" />
            )}
            {!isCollapsed && (
              <h2 className="text-lg font-semibold">{config.header.title}</h2>
            )}
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="size-7 bg-accent! rounded-md! absolute top-5 right-0 translate-x-[130%]"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <SidebarIcon weight="duotone" className="h-4 w-4" />
      </Button>

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
  );
}
