import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardApi } from "@/lib/api";
import { boardKeys } from "@/lib/hooks/use-boards";
import type { CreateTimelineEntryRequest } from "@/types";

// Query keys for timeline entries
export const timelineKeys = {
  all: ["timeline"] as const,
  lists: () => [...timelineKeys.all, "list"] as const,
  list: (boardId: string) => [...timelineKeys.lists(), boardId] as const,
};

// Get timeline entries for a board
export function useTimeline(boardId: string, enabled = true) {
  return useQuery({
    queryKey: timelineKeys.list(boardId),
    queryFn: async () => {
      const response = await boardApi.getTimeline(boardId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    enabled: enabled && !!boardId,
  });
}

// Create a timeline entry
export function useCreateTimelineEntry(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTimelineEntryRequest) => {
      const response = await boardApi.createTimelineEntry(boardId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: timelineKeys.list(boardId),
      });
      // Bump "last edited" on the boards list page.
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

// Update a timeline entry
export function useUpdateTimelineEntry(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      content,
      images,
    }: {
      entryId: string;
      content: string;
      images?: string[];
    }) => {
      const response = await boardApi.updateTimelineEntry(
        entryId,
        content,
        images,
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: timelineKeys.list(boardId),
      });
      // Bump "last edited" on the boards list page.
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

// Delete a timeline entry
export function useDeleteTimelineEntry(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const response = await boardApi.deleteTimelineEntry(entryId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: timelineKeys.list(boardId),
      });
      // Bump "last edited" on the boards list page.
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
