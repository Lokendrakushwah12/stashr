"use client";

import { TeamSwitcher } from "@/components/team/TeamSwitcher";
import type { Folder, FolderCollaboration } from "@/types";
import {
  BookmarkSquare,
  ClipboardText,
  InboxLine,
  Settings,
} from "@solar-icons/react-perf/BoldDuotone";
import { User } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SidebarConfig } from "../types";

interface UseBookmarkSidebarConfigProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function useBookmarkSidebarConfig({
  onNavigate,
  currentPath = "/board",
}: UseBookmarkSidebarConfigProps = {}) {
  const { data: session } = useSession();
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

  const fetchPendingInvitationsCount = async () => {
    if (!session?.user?.id) return;

    try {
      const [folderRes, teamRes] = await Promise.all([
        fetch("/api/collaborations/pending"),
        fetch("/api/teams/invitations"),
      ]);
      if (!folderRes.ok || !teamRes.ok) {
        throw new Error("Failed to fetch invitations");
      }
      const folderData = (await folderRes.json()) as {
        invitations: (FolderCollaboration & { folder?: Folder })[];
      };
      const teamData = (await teamRes.json()) as {
        invitations: { id: string }[];
      };
      const folderPending =
        folderData.invitations?.filter((inv) => inv.status === "pending")
          .length ?? 0;
      const teamPending = teamData.invitations?.length ?? 0;
      setPendingInvitationsCount(folderPending + teamPending);
    } catch (error) {
      console.error("Error fetching invitations count:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      void fetchPendingInvitationsCount();
    }
  }, [session?.user?.id]);

  const config: SidebarConfig = {
    headerSlot: <TeamSwitcher />,
    collapsedHeaderSlot: <TeamSwitcher compact />,
    sections: [
      {
        id: "navigation",
        title: "Navigation",
        items: [
          {
            id: "boards",
            label: "All Boards",
            icon: ClipboardText,
            href: "/board",
            active: currentPath.startsWith("/board"),
          },
          {
            id: "bookmarks",
            label: "All Bookmarks",
            icon: BookmarkSquare,
            href: "/bookmarks",
            active: currentPath.startsWith("/bookmarks"),
          },
          {
            id: "inbox",
            label: "Inbox",
            icon: InboxLine,
            href: "/inbox",
            active: currentPath.startsWith("/inbox"),
            badge:
              pendingInvitationsCount > 0
                ? {
                    count: pendingInvitationsCount,
                    variant: "destructive" as const,
                  }
                : undefined,
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            href: "/settings",
            active: currentPath.startsWith("/settings"),
          },
          {
            id: "profile",
            label: "Profile",
            icon: User,
            href: "/profile",
            active: currentPath.startsWith("/profile"),
            mobileOnly: true,
          },
        ],
      },
    ],

    account: {
      showAccountInfo: true,
    },
  };

  return {
    config,
    pendingInvitationsCount,
    refreshInvitationsCount: fetchPendingInvitationsCount,
  };
}
