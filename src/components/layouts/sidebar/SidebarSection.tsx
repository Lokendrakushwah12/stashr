"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { AltArrowDown } from "@solar-icons/react-perf/category/style/LineDuotone";
import { useState } from "react";
import SidebarItem from "./SidebarItem";
import type { SidebarSection as SidebarSectionType } from "./types";

interface SidebarSectionProps {
  section: SidebarSectionType;
  onItemClick?: (item: SidebarSectionType["items"][0]) => void;
  className?: string;
  isCollapsed?: boolean;
}

export default function SidebarSection({
  section,
  onItemClick,
  className,
  isCollapsed,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(!section.defaultCollapsed);

  const handleToggle = () => {
    if (section.collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {section.title && (
        <div>
          {section.collapsible ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-auto w-full justify-between px-2 py-1 text-xs font-medium"
                  onClick={handleToggle}
                >
                  <span
                    className={cn(
                      "tracking-wide uppercase",
                      isCollapsed && "hidden",
                    )}
                  >
                    {section.title}
                  </span>
                  <AltArrowDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1">
                {section.items
                  .filter((item) => !item.mobileOnly)
                  .map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      onClick={() => onItemClick?.(item)}
                    />
                  ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="px-2 py-1">
              <span
                className={cn(
                  "text-muted-foreground font-mono text-xs font-medium tracking-wide uppercase",
                  isCollapsed && "hidden",
                )}
              >
                {section.title}
              </span>
            </div>
          )}
        </div>
      )}

      {!section.collapsible && (
        <div className="flex w-full flex-col items-center space-y-1">
          {section.items
            .filter((item) => !item.mobileOnly)
            .map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                onClick={() => onItemClick?.(item)}
                isCollapsed={isCollapsed}
              />
            ))}
        </div>
      )}
    </div>
  );
}
