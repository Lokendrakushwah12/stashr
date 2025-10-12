"use client";

import Stashr from "@/assets/svgs/assets/svgs/Stashr";
import type { Folder, FolderCollaboration } from "@/types";
import {
  BookmarksIcon,
  EnvelopeIcon,
  SparkleIcon,
  UserIcon
} from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SidebarConfig } from "../types";

interface UseBookmarkSidebarConfigProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function useBookmarkSidebarConfig({ onNavigate, currentPath = "/board" }: UseBookmarkSidebarConfigProps = {}) {
  const { data: session } = useSession();
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

  const fetchPendingInvitationsCount = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/collaborations/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      const data = await response.json() as { invitations: (FolderCollaboration & { folder?: Folder })[] };
      setPendingInvitationsCount(data.invitations?.filter(inv => inv.status === 'pending').length ?? 0);
    } catch (error) {
      console.error('Error fetching invitations count:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      void fetchPendingInvitationsCount();
    }
  }, [session?.user?.id]);

  const config: SidebarConfig = {
    header: {
      title: "Stashr",
      icon: Stashr,
    },
    sections: [
      {
        id: "navigation",
        title: "Navigation",
        items: [
          {
            id: "boards",
            label: "All Boards",
            icon: SparkleIcon,
            href: "/board",
            active: currentPath.startsWith("/board"),
          },
          {
            id: "bookmarks",
            label: "All Bookmarks",
            icon: BookmarksIcon,
            href: "/bookmarks",
            active: currentPath.startsWith("/bookmarks"),
          },
          {
            id: "inbox",
            label: "Inbox",
            icon: EnvelopeIcon,
            href: "/inbox",
            active: currentPath.startsWith("/inbox"),
            badge: pendingInvitationsCount > 0 ? {
              count: pendingInvitationsCount,
              variant: "destructive" as const,
            } : undefined,
          },
          {
            id: "profile",
            label: "Profile",
            icon: UserIcon,
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
