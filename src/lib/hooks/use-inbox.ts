import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  Board,
  BoardCollaboration,
  Folder,
  FolderCollaboration,
} from "@/types";

export const inboxKeys = {
  all: ["inbox"] as const,
  lists: () => [...inboxKeys.all, "list"] as const,
  list: (userId?: string | null) => [...inboxKeys.lists(), { userId }] as const,
};

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  teamLogoUrl?: string | null;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "pending" | "declined" | "accepted";
  invitedByName?: string;
  invitedAt: string;
  respondedAt?: string;
}

export interface TeamDeclineNotification {
  id: string;
  teamId: string;
  teamName: string;
  teamLogoUrl?: string | null;
  role: "owner" | "admin" | "editor" | "viewer";
  invitedEmail: string;
  invitedName: string | null;
  respondedAt?: string;
}

export type InboxData = {
  folderInvitations: (FolderCollaboration & { folder?: Folder })[];
  boardInvitations: (BoardCollaboration & { board?: Board })[];
  teamInvitations: TeamInvitation[];
  teamDeclineNotifications: TeamDeclineNotification[];
};

export function useInbox(
  userId?: string | null,
): UseQueryResult<InboxData, Error> {
  return useQuery<InboxData, Error>({
    queryKey: inboxKeys.list(userId),
    queryFn: async () => {
      const [folderResponse, boardResponse, teamResponse] = await Promise.all([
        fetch("/api/collaborations/pending"),
        fetch("/api/boards/collaborations/pending"),
        fetch("/api/teams/invitations"),
      ]);
      if (!folderResponse.ok) {
        throw new Error("Failed to load folder invitations");
      }
      if (!boardResponse.ok) {
        throw new Error("Failed to load board invitations");
      }
      if (!teamResponse.ok) {
        throw new Error("Failed to load team invitations");
      }

      const folderData = (await folderResponse.json()) as {
        invitations: (FolderCollaboration & { folder?: Folder })[];
      };
      const boardData = (await boardResponse.json()) as {
        invitations: (BoardCollaboration & { board?: Board })[];
      };
      const teamData = (await teamResponse.json()) as {
        invitations: TeamInvitation[];
        declinedNotifications: TeamDeclineNotification[];
      };

      return {
        folderInvitations: folderData.invitations ?? [],
        boardInvitations: boardData.invitations ?? [],
        teamInvitations: teamData.invitations ?? [],
        teamDeclineNotifications: teamData.declinedNotifications ?? [],
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes, like boards/bookmarks
  });
}
