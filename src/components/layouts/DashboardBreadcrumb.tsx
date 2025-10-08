"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useFolder } from "@/lib/hooks/use-bookmarks";
import { getBreadcrumbSegments } from "@/lib/breadcrumb-config";
import { useSidebar } from "@/lib/contexts/sidebar-context";
import { SidebarIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const params = useParams();
  const boardId = params?.id as string | undefined;
  const { toggleCollapsed } = useSidebar();

  // Fetch board/folder data if we're on a specific board page
  const shouldFetchBoard = !!boardId && pathname?.includes(`/board/${boardId}`);
  const { data: folderResponse } = useFolder(boardId || "");
  const board = shouldFetchBoard ? folderResponse?.data?.folder : null;

  // Generate breadcrumb segments dynamically
  const segments = useMemo(() => {
    const dynamicData: Record<string, unknown> = {};
    
    // Add dynamic data based on the current route
    if (board?.name) {
      dynamicData.boardName = board.name;
    }
    
    return getBreadcrumbSegments(pathname, params as Record<string, string>, dynamicData);
  }, [pathname, params, board?.name]);

  // Don't render if no segments
  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mb-2">
      {/* Sidebar Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex size-8 bg-accent border border-border rounded-sm hover:bg-accent/80"
        onClick={toggleCollapsed}
      >
        <SidebarIcon weight="duotone" className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </Button>

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList className="gap-1 sm:gap-1">
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            
            return (
              <div key={`${segment.label}-${index}`} className="contents">
                <BreadcrumbItem>
                  {segment.href && !isLast ? (
                    <BreadcrumbLink asChild>
                      <Link href={segment.href}>{segment.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                
                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
