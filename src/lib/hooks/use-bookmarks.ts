import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookmarkApi, folderApi } from '@/lib/api';
import type { UpdateBookmarkRequest, UpdateFolderRequest } from '@/types';

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
  list: (filters: string) => [...folderKeys.lists(), { filters }] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
};

// Folder hooks
export function useFolders() {
  return useQuery({
    queryKey: folderKeys.lists(),
    queryFn: () => folderApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => folderApi.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Folder mutations
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof folderApi.create>[0]) => folderApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderRequest }) => folderApi.update(id, data),
    onSuccess: (data, variables) => {
      void queryClient.setQueryData(folderKeys.detail(variables.id), data.data?.folder);
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => folderApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

// Bookmark mutations
export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof bookmarkApi.create>[0]) => bookmarkApi.create(data),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.detail(variables.folderId) });
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkRequest }) => bookmarkApi.update(id, data),
    onSuccess: (data, variables) => {
      void queryClient.setQueryData(bookmarkKeys.detail(variables.id), data.data?.bookmark);
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookmarkApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
} 