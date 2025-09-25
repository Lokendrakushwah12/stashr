"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    badge?: {
      count: number;
      variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "gray";
    };
    active?: boolean;
    disabled?: boolean;
  };
  onClick?: () => void;
  className?: string;
  isCollapsed?: boolean;
}

export default function SidebarItem({ item, onClick, className, isCollapsed }: SidebarItemProps) {
  const handleClick = () => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    } else if (onClick) {
      onClick();
    }
  };

  const Icon = item.icon;

  return (
    <Button
      variant={item.active ? "secondary" : "ghost"}
      className={cn(
        "relative justify-start gap-2 h-auto p-2 mx-auto!",
        item.disabled && "opacity-50 cursor-not-allowed",
        isCollapsed ? "size-8 rounded-md!" : "w-full",
        className
      )}
      onClick={handleClick}
      disabled={item.disabled}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <span className={cn("flex-1 text-left truncate",isCollapsed && "hidden")}>{item.label}</span>
      {item.badge && item.badge.count > 0 && (
        <Badge variant={item.badge.variant ?? "default"} className={cn("text-xs text-white", isCollapsed && "absolute size-4 p-1 rounded-sm right-0 top-0 -translate-y-1/4 translate-x-1/4")}>
          {item.badge.count}
        </Badge>
      )}
    </Button>
  );
}
