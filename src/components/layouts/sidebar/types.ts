import type { ReactNode } from "react";

export interface SidebarItem {
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
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface SidebarConfig {
  header?: {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    subtitle?: string;
  };
  sections: SidebarSection[];
  account?: {
    showAccountInfo?: boolean;
  };
}

export interface SidebarProps {
  config: SidebarConfig;
  className?: string;
  width?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
