import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/lib/api';
import type { Board, BoardCard, CreateBoardRequest, UpdateBoardRequest, CreateBoardCardRequest, UpdateBoardCardRequest } from '@/types';
import { toast } from 'sonner';

// Query keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (filters: string) => [...boardKeys.lists(), { filters }] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

export const boardCardKeys = {
  all: ['boardCards'] as const,
  lists: () => [...boardCardKeys.all, 'list'] as const,
  list: (boardId: string) => [...boardCardKeys.lists(), boardId] as const,
  details: () => [...boardCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardCardKeys.details(), id] as const,
};

// Board hooks
export function useBoards() {
  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: () => boardApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBoard(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardApi.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Board mutations
export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBoardRequest) => {
      const response = await boardApi.create(data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      toast.success('Board created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create board: ${error.message}`);
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBoardRequest }) => {
      const response = await boardApi.update(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (response, variables) => {
      // Update the cache with the correct structure
      void queryClient.setQueryData(boardKeys.detail(variables.id), response);
      // Invalidate board list to update counts/colors
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update board: ${error.message}`);
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await boardApi.delete(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      toast.success('Board deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete board: ${error.message}`);
    },
  });
}

// Board Card hooks
export function useBoardCards(boardId: string) {
  return useQuery({
    queryKey: boardCardKeys.list(boardId),
    queryFn: () => boardApi.getCards(boardId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Board Card mutations
export function useCreateBoardCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBoardCardRequest) => {
      const response = await boardApi.createCard(data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (response, variables) => {
      void queryClient.invalidateQueries({ queryKey: boardCardKeys.list(variables.boardId) });
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
      toast.success('Card created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create card: ${error.message}`);
    },
  });
}

export function useUpdateBoardCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBoardCardRequest }) => {
      const response = await boardApi.updateCard(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (response, variables) => {
      void queryClient.setQueryData(boardCardKeys.detail(variables.id), response);
      void queryClient.invalidateQueries({ queryKey: boardCardKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update card: ${error.message}`);
    },
  });
}

export function useDeleteBoardCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId: string }) => {
      const response = await boardApi.deleteCard(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: boardCardKeys.list(variables.boardId) });
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.boardId) });
      toast.success('Card deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete card: ${error.message}`);
    },
  });
}
