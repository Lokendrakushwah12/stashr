import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  Board,
  BoardCollaboration,
  Folder,
  FolderCollaboration,
} from "@/types";
import { toast } from "sonner";

export const inboxKeys = {
  all: ["inbox"] as const,
  lists: () => [...inboxKeys.all, "list"] as const,
  list: (userId?: string | null) => [...inboxKeys.lists(), { userId }] as const,
};

export type InboxData = {
  folderInvitations: (FolderCollaboration & { folder?: Folder })[];
  boardInvitations: (BoardCollaboration & { board?: Board })[];
};

export function useInbox(
  userId?: string | null,
): UseQueryResult<InboxData, Error> {
  return useQuery<InboxData, Error>({
    queryKey: inboxKeys.list(userId),
    queryFn: async () => {
      const folderResponse = await fetch("/api/collaborations/pending");
      if (!folderResponse.ok) {
        throw new Error("Failed to load folder invitations");
      }
      const folderData = (await folderResponse.json()) as {
        invitations: (FolderCollaboration & { folder?: Folder })[];
      };

      const boardResponse = await fetch("/api/boards/collaborations/pending");
      if (!boardResponse.ok) {
        throw new Error("Failed to load board invitations");
      }
      const boardData = (await boardResponse.json()) as {
        invitations: (BoardCollaboration & { board?: Board })[];
      };

      return {
        folderInvitations: folderData.invitations ?? [],
        boardInvitations: boardData.invitations ?? [],
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes, like boards/bookmarks
  });
}
