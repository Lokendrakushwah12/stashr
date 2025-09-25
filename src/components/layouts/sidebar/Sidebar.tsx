"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SidebarSection from "./SidebarSection";
import AccountPopover from "./AccountPopover";
import type { SidebarProps, SidebarItem as SidebarItemType } from "./types";

export default function Sidebar({ 
  config, 
  className = "", 
  width = "w-80",
  collapsible = true,
  defaultCollapsed = false 
}: SidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleItemClick = (item: SidebarItemType) => {
    if (item.href) {
      router.push(item.href);
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div className={cn(
      "bg-background border-r border-border relative flex flex-col h-full transition-all duration-200",
      width,
      isCollapsed && "w-16",
      className
    )}>
      {/* Header */}
      {config.header && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
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
        className="size-7 bg-accent! absolute top-3 right-0 translate-x-1/2 "
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "" : "←"}
      </Button>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          {config.sections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Account Section */}
      {config.account?.showAccountInfo && (
        <div className="p-2 border-t border-border">
          <AccountPopover />
        </div>
      )}
    </div>
  );
}
