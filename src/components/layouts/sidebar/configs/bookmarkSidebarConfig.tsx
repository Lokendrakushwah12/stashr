"use client";

import type { FolderCollaboration, Folder } from "@/types";
import { 
  BookmarksIcon, 
  FoldersIcon, 
  EnvelopeIcon,
} from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SidebarConfig } from "../types";
import { StashrLogo } from "@/components/ui/icons";
import Stashr from "@/assets/svgs/assets/svgs/Stashr";

interface UseBookmarkSidebarConfigProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export function useBookmarkSidebarConfig({ onNavigate, currentPath = "/folder" }: UseBookmarkSidebarConfigProps = {}) {
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
      setPendingInvitationsCount(data.invitations?.length ?? 0);
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
            id: "folders",
            label: "All Folders",
            icon: FoldersIcon,
            href: "/folder",
            active: currentPath === "/folder",
          },
          {
            id: "inbox",
            label: "Inbox",
            icon: EnvelopeIcon,
            href: "/folder/inbox",
            active: currentPath === "/folder/inbox",
            badge: pendingInvitationsCount > 0 ? {
              count: pendingInvitationsCount,
              variant: "destructive" as const,
            } : undefined,
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
