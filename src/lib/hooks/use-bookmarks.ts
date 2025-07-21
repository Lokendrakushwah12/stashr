import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookmarkApi, folderApi } from '@/lib/api';
import type { CreateBookmarkRequest, UpdateBookmarkRequest } from '@/types';

// Query keys
export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  list: (filters: string) => [...bookmarkKeys.lists(), { filters }] as const,
  details: () => [...bookmarkKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookmarkKeys.details(), id] as const,
};

export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
};

// Folder hooks
export function useFolders() {
  return useQuery({
    queryKey: folderKeys.lists(),
    queryFn: async () => {
      const response = await folderApi.getAll();
      if (!response.data) {
        throw new Error(response.error || 'Failed to fetch folders');
      }
      return response.data.folders;
    },
  });
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: async () => {
      const response = await folderApi.getById(id);
      if (!response.data) {
        throw new Error(response.error || 'Failed to fetch folder');
      }
      return response.data.folder;
    },
    enabled: !!id,
  });
}

// Folder mutations
export function useCreateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: folderApi.create,
    onSuccess: () => {
      // Invalidate and refetch folders list
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => folderApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific folder in cache
      queryClient.setQueryData(folderKeys.detail(variables.id), data.data?.folder);
      // Invalidate folders list
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: folderApi.delete,
    onSuccess: () => {
      // Invalidate folders list
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

// Bookmark mutations
export function useCreateBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bookmarkApi.create,
    onSuccess: (data, variables) => {
      // Invalidate the specific folder
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(variables.folderId) });
      // Invalidate folders list to update bookmark counts
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkRequest }) => 
      bookmarkApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate all folders since bookmark could be in any folder
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bookmarkApi.delete,
    onSuccess: () => {
      // Invalidate all folders since bookmark could be in any folder
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
} 