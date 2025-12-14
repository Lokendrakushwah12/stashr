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
      variant?:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning"
        | "info"
        | "gray";
    };
    active?: boolean;
    disabled?: boolean;
  };
  onClick?: () => void;
  className?: string;
  isCollapsed?: boolean;
}

export default function SidebarItem({
  item,
  onClick,
  className,
  isCollapsed,
}: SidebarItemProps) {
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
        "group relative h-auto justify-center gap-1 p-2",
        item.disabled && "cursor-not-allowed opacity-50",
        isCollapsed ? "size-8 rounded-md!" : "w-full",
        // Mobile specific styles
        "md:justify-start md:gap-2",
        className,
      )}
      onClick={handleClick}
      disabled={item.disabled}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0",
            item.active
              ? "text-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        />
      )}
      <span
        className={cn(
          "hidden truncate text-left md:block",
          isCollapsed && "hidden",
        )}
      >
        {item.label}
      </span>
      {item.badge && item.badge.count > 0 && (
        <Badge
          variant={item.badge.variant ?? "default"}
          className={cn(
            "text-xs text-white",
            isCollapsed &&
              "absolute top-0 right-0 size-4 translate-x-1/4 -translate-y-1/4 rounded-sm p-1",
          )}
        >
          {item.badge.count}
        </Badge>
      )}
    </Button>
  );
}
