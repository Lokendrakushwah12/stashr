"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getBreadcrumbSegments } from "@/lib/breadcrumb-config";
import { useSidebar } from "@/lib/contexts/sidebar-context";
import { useBoard } from "@/lib/hooks/use-boards";
import { useFolder } from "@/lib/hooks/use-bookmarks";
import { SidebarMinimalistic } from "@solar-icons/react-perf/category/style/BoldDuotone";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const params = useParams();
  const boardId = params?.id as string | undefined;
  const { toggleCollapsed } = useSidebar();

  // Fetch board/folder data if we're on a specific board or bookmark page
  const shouldFetchBoard = !!boardId && pathname?.includes(`/board/${boardId}`);
  const shouldFetchBookmark =
    !!boardId && pathname?.includes(`/bookmarks/${boardId}`);

  const { data: boardResponse } = useBoard(
    shouldFetchBoard ? (boardId ?? "") : "",
  );
  const { data: folderResponse } = useFolder(
    shouldFetchBookmark ? (boardId ?? "") : "",
  );

  const board = shouldFetchBoard ? boardResponse?.data?.board : null;
  const folder = shouldFetchBookmark ? folderResponse?.data?.folder : null;

  // Generate breadcrumb segments dynamically
  const segments = useMemo(() => {
    const dynamicData: Record<string, unknown> = {};

    // Add dynamic data based on the current route
    if (shouldFetchBoard && board?.name) {
      dynamicData.boardName = board.name;
    }
    if (shouldFetchBookmark && folder?.name) {
      dynamicData.folderName = folder.name;
    }

    return getBreadcrumbSegments(
      pathname,
      params as Record<string, string>,
      dynamicData,
    );
  }, [
    pathname,
    params,
    board?.name,
    folder?.name,
    shouldFetchBoard,
    shouldFetchBookmark,
  ]);

  // Don't render if no segments
  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 flex items-center gap-3">
      {/* Sidebar Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="bg-accent border-border hover:bg-accent/80 hidden size-7 rounded-sm border md:flex"
        onClick={toggleCollapsed}
      >
        <SidebarMinimalistic className="text-muted-foreground hover:text-foreground h-4 w-4" />
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
