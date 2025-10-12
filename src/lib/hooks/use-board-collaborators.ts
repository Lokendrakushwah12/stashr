import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/lib/api';
import type { AddCollaboratorRequest, BoardCollaboration } from '@/types';

// Query keys for board collaborators
export const boardCollaboratorKeys = {
  all: ['board-collaborators'] as const,
  lists: () => [...boardCollaboratorKeys.all, 'list'] as const,
  list: (boardId: string) => [...boardCollaboratorKeys.lists(), boardId] as const,
};

// Get collaborators for a board
export function useBoardCollaborators(boardId: string, enabled = true) {
  return useQuery({
    queryKey: boardCollaboratorKeys.list(boardId),
    queryFn: async () => {
      const response = await boardApi.getCollaborators(boardId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    enabled: enabled && !!boardId,
  });
}

// Add a collaborator to a board
export function useAddBoardCollaborator(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddCollaboratorRequest) => {
      const response = await boardApi.addCollaborator(boardId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardCollaboratorKeys.list(boardId) });
    },
  });
}

// Update a collaborator's role
export function useUpdateBoardCollaboratorRole(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collaboratorId, role }: { collaboratorId: string; role: 'editor' | 'viewer' }) => {
      const response = await boardApi.updateCollaboratorRole(boardId, collaboratorId, role);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardCollaboratorKeys.list(boardId) });
    },
  });
}

// Remove a collaborator from a board
export function useRemoveBoardCollaborator(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collaboratorId: string) => {
      const response = await boardApi.removeCollaborator(boardId, collaboratorId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardCollaboratorKeys.list(boardId) });
    },
  });
}

