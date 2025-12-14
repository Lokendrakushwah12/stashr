import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookmarkApi, folderApi } from "@/lib/api";
import type { UpdateBookmarkRequest, UpdateFolderRequest } from "@/types";
import { toast } from "sonner";

// Query keys
export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  lists: () => [...bookmarkKeys.all, "list"] as const,
  list: (filters: string) => [...bookmarkKeys.lists(), { filters }] as const,
  details: () => [...bookmarkKeys.all, "detail"] as const,
  detail: (id: string) => [...bookmarkKeys.details(), id] as const,
};

export const folderKeys = {
  all: ["folders"] as const,
  lists: () => [...folderKeys.all, "list"] as const,
  list: (filters: string) => [...folderKeys.lists(), { filters }] as const,
  details: () => [...folderKeys.all, "detail"] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
};

// Folder hooks
export function useFolders(search?: string) {
  return useQuery({
    queryKey: search ? [...folderKeys.lists(), search] : folderKeys.lists(),
    queryFn: () => folderApi.getAll(search),
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
    mutationFn: async (data: Parameters<typeof folderApi.create>[0]) => {
      const response = await folderApi.create(data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success(`Folder "${data.data?.folder.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFolderRequest;
    }) => {
      const response = await folderApi.update(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (response, variables) => {
      // Update the cache with the correct structure
      void queryClient.setQueryData(folderKeys.detail(variables.id), response);
      // Invalidate folder list to update counts/colors
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update folder: ${error.message}`);
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await folderApi.delete(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success("Folder deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete folder: ${error.message}`);
    },
  });
}

// Bookmark mutations
export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof bookmarkApi.create>[0]) => {
      const response = await bookmarkApi.create(data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: folderKeys.detail(variables.folderId),
      });
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success(
        `Bookmark "${data.data?.bookmark.title}" added successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to add bookmark: ${error.message}`);
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBookmarkRequest;
    }) => {
      const response = await bookmarkApi.update(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (data, variables) => {
      void queryClient.setQueryData(
        bookmarkKeys.detail(variables.id),
        data.data?.bookmark,
      );
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
      toast.success(
        `Bookmark "${data.data?.bookmark.title}" updated successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bookmark: ${error.message}`);
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      folderId: _folderId,
    }: {
      id: string;
      folderId: string;
    }) => {
      const response = await bookmarkApi.delete(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (_, variables) => {
      // Update the folder detail cache to remove the deleted bookmark immediately
      const currentFolder = queryClient.getQueryData(
        folderKeys.detail(variables.folderId),
      );
      if (
        currentFolder &&
        typeof currentFolder === "object" &&
        "bookmarks" in currentFolder
      ) {
        const updatedFolder = {
          ...currentFolder,
          bookmarks: (currentFolder.bookmarks as Array<{ _id: string }>).filter(
            (b) => b._id !== variables.id,
          ),
        };
        queryClient.setQueryData(
          folderKeys.detail(variables.folderId),
          updatedFolder,
        );
      }

      // Also invalidate the folders list to update bookmark counts
      void queryClient.invalidateQueries({ queryKey: folderKeys.lists() });

      // Fallback: invalidate the specific folder detail query to ensure UI updates
      void queryClient.invalidateQueries({
        queryKey: folderKeys.detail(variables.folderId),
      });

      toast.success("Bookmark deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bookmark: ${error.message}`);
    },
  });
}
