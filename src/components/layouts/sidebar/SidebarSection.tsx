"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useState } from "react";
import SidebarItem from "./SidebarItem";
import type { SidebarSection as SidebarSectionType } from "./types";

interface SidebarSectionProps {
  section: SidebarSectionType;
  onItemClick?: (item: SidebarSectionType["items"][0]) => void;
  className?: string;
  isCollapsed?: boolean;
}

export default function SidebarSection({ section, onItemClick, className, isCollapsed }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(!section.defaultCollapsed);

  const handleToggle = () => {
    if (section.collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("space-y-1 w-full", className)}>
      {section.title && (
        <div>
          {section.collapsible ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-2 py-1 h-auto text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={handleToggle}
                >
                  <span className={cn("uppercase tracking-wide", isCollapsed && "hidden")}>{section.title}</span>
                  <CaretDownIcon 
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isOpen && "rotate-180"
                    )} 
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {section.items.filter(item => !item.mobileOnly).map((item) => (
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
              <span className={cn("text-xs font-mono font-medium text-muted-foreground uppercase tracking-wide", isCollapsed && "hidden")}>
                {section.title}
              </span>
            </div>
          )}
        </div>
      )}
      
      {!section.collapsible && (
        <div className="space-y-1 w-full flex flex-col items-center">
          {section.items.filter(item => !item.mobileOnly).map((item) => (
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
