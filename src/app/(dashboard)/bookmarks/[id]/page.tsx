"use client";

import AddBookmarkDialog from "@/components/bookmark/AddBookmarkDialog";
import BookmarkCard from "@/components/bookmark/BookmarkCard";
import EditBookmarkDialog from "@/components/bookmark/EditBookmarkDialog";
import CollaboratorDialog from "@/components/folder/CollaboratorDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ColorPicker from "@/components/ui/color-picker";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InlineEdit from "@/components/ui/inline-edit";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteBookmark,
  useDeleteFolder,
  useFolder,
  useUpdateFolder,
} from "@/lib/hooks/use-bookmarks";
import type { Bookmark } from "@/types";
import {
  Refresh,
  Share,
  TrashBinTrash,
  UserPlus,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { ArrowLeft, MoreVertical, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const BookmarkFolderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use React Query for data fetching
  const {
    data: folderResponse,
    isLoading,
    error,
    refetch,
  } = useFolder(folderId);

  const folder = folderResponse?.data?.folder;
  const userRole = folder?.userRole ?? "owner";
  const canEdit = userRole === "owner" || userRole === "editor";

  // No-op functions for viewers
  const noOpEdit = () => {
    // No operation for viewers
  };

  const noOpDelete = () => {
    // No operation for viewers
  };

  // Use React Query mutations
  const deleteBookmarkMutation = useDeleteBookmark();
  const deleteFolderMutation = useDeleteFolder();
  const updateFolderMutation = useUpdateFolder();

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      await deleteBookmarkMutation.mutateAsync({ id: bookmarkId, folderId });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleDeleteFolder = () => {
    setDropdownOpen(false);
    setShowDeleteFolderConfirm(true);
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!canEdit || !folder) return;

    try {
      await updateFolderMutation.mutateAsync({
        id: folderId,
        data: { name: newTitle },
      });
    } catch (error) {
      console.error("Error updating title:", error);
      throw error;
    }
  };

  const handleUpdateDescription = async (newDescription: string) => {
    if (!canEdit || !folder) return;

    try {
      await updateFolderMutation.mutateAsync({
        id: folderId,
        data: { description: newDescription },
      });
    } catch (error) {
      console.error("Error updating description:", error);
      throw error;
    }
  };

  const handleUpdateColor = async (newColor: string) => {
    if (!canEdit || !folder) return;

    try {
      await updateFolderMutation.mutateAsync({
        id: folderId,
        data: { color: newColor },
      });
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  const confirmDeleteFolder = async () => {
    try {
      await deleteFolderMutation.mutateAsync(folderId);
      router.push("/bookmarks");
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  if (error) {
    return (
      <div className="mx-auto flex min-h-[90vh] max-w-[86rem] flex-col items-center justify-center px-5 text-center">
        <div className="max-w-md">
          <p className="text-destructive mb-4">
            {error.message || "Bookmark folder not found"}
          </p>
          <Button onClick={() => router.push("/bookmarks")} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookmarks
          </Button>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="mx-auto flex min-h-[90vh] max-w-[86rem] flex-col items-center justify-center px-5 text-center">
        <div className="max-w-md">
          <Refresh className="text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading bookmark folder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 pt-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-shrink-0 items-center justify-center">
              <ColorPicker
                value={folder.color ?? "#3b82f6"}
                onChange={handleUpdateColor}
                disabled={!canEdit}
              >
                <button
                  type="button"
                  disabled={!canEdit}
                  className="size-5 cursor-pointer rounded-sm opacity-60 transition-all hover:opacity-100 disabled:cursor-not-allowed"
                  style={{ backgroundColor: folder.color ?? "#3b82f6" }}
                />
              </ColorPicker>
            </div>
            <InlineEdit
              value={folder.name}
              onSave={handleUpdateTitle}
              placeholder="Enter folder name..."
              fontSize="3xl"
              fontWeight="semibold"
              disabled={!canEdit}
              maxLength={100}
              allowEmpty={false}
              className="font-display tracking-tight"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <Refresh className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {canEdit && (
            <Button onClick={() => setShowAddBookmark(true)}>
              <Plus className="h-4 w-4" />
              Add Bookmark
            </Button>
          )}

          {(userRole === "owner" || canEdit) && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => {
                    const url = `${window.location.origin}/public/folder/${folderId}`;
                    navigator.clipboard?.writeText(url).catch(() => {
                      void 0;
                    });
                    window.open(url, "_blank");
                  }}
                  className="cursor-pointer rounded-lg"
                >
                  <Share className="h-4 w-4" />
                  Share Public Link
                </DropdownMenuItem>
                {userRole === "owner" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCollaborators(true);
                    }}
                    className="cursor-pointer rounded-lg text-nowrap"
                  >
                    <UserPlus className="h-4 w-4" />
                    Manage Collaborators
                  </DropdownMenuItem>
                )}
                {userRole === "owner" && (
                  <DropdownMenuItem
                    onClick={handleDeleteFolder}
                    className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
                  >
                    <TrashBinTrash className="text-destructive h-4 w-4" />
                    {deleteFolderMutation.isPending
                      ? "Deleting..."
                      : "Delete Folder"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <InlineEdit
        value={folder.description ?? ""}
        onSave={handleUpdateDescription}
        placeholder="Add a description..."
        fontSize="base"
        fontWeight="normal"
        disabled={!canEdit}
        multiline
        maxLength={500}
        allowEmpty={true}
        className="text-muted-foreground"
      />

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="absolute inset-0 z-10 bg-linear-to-b from-transparent to-[#fafafa] dark:to-[#0f0f11]" />
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden p-1">
              <CardContent className="p-0">
                <div className="mb-2 flex w-full items-center gap-1 pt-1 pl-1">
                  <Skeleton className="h-8 w-9 rounded-md" />
                  <div className="flex w-full flex-col gap-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <Skeleton className="h-48 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : folder.bookmarks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative h-32 w-full sm:w-[25rem]">
            <div className="from-background absolute bottom-0 z-[99] h-16 w-full bg-gradient-to-t to-transparent" />
            <div className="dark:bg-muted/60 absolute bottom-0 z-20 h-[60%] w-full rounded-t-2xl border border-[#ddd] bg-white/60 p-2 backdrop-blur-2xl dark:border-white/10">
              <div className="mb-2 h-[50%] w-[50%] rounded-lg bg-black/5 dark:bg-white/10" />
              <div className="h-[50%] w-full rounded-lg bg-black/5 dark:bg-white/10" />
            </div>
            <div className="dark:bg-muted/50 absolute bottom-4 left-1/2 z-10 h-[60%] w-[95%] -translate-x-1/2 scale-95 rounded-t-2xl border border-[#ddd] bg-white/50 p-2 backdrop-blur-2xl transition-all group-hover:-rotate-2 dark:border-white/10" />
            <div className="dark:bg-muted/40 absolute bottom-8 left-1/2 z-0 h-[60%] w-[85%] -translate-x-1/2 scale-90 rounded-t-2xl border border-[#ddd] bg-white/40 p-2 transition-all group-hover:rotate-2 dark:border-white/10" />
          </div>
          <h3 className="mb-2 text-2xl font-medium">
            {canEdit
              ? "You don't have any bookmarks yet"
              : "No bookmarks in this folder"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {canEdit
              ? "Get started by adding your first bookmark to this folder."
              : "This folder doesn't contain any bookmarks yet."}
          </p>
          {canEdit && (
            <Button variant="outline" onClick={() => setShowAddBookmark(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Bookmark
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folder.bookmarks?.map((bookmark) => (
            <BookmarkCard
              key={`${bookmark._id}-${editingBookmark?._id === bookmark._id ? "editing" : "normal"}`}
              bookmark={bookmark}
              onEdit={canEdit ? setEditingBookmark : noOpEdit}
              onDelete={canEdit ? handleDeleteBookmark : noOpDelete}
              showDropdown={canEdit}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddBookmarkDialog
        open={showAddBookmark}
        onOpenChange={setShowAddBookmark}
        folderId={folderId}
        onSuccess={() => {
          setShowAddBookmark(false);
          // React Query will automatically refetch after mutation
        }}
      />

      {editingBookmark && (
        <EditBookmarkDialog
          open={!!editingBookmark}
          onOpenChange={(open) => !open && setEditingBookmark(null)}
          bookmark={editingBookmark}
          onSuccess={() => {
            setEditingBookmark(null);
            // React Query will automatically refetch after mutation
          }}
        />
      )}

      <CollaboratorDialog
        open={showCollaborators}
        onOpenChange={setShowCollaborators}
        folderId={folderId}
        folderName={folder?.name || ""}
      />

      {/* Folder Deletion Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteFolderConfirm}
        onOpenChange={setShowDeleteFolderConfirm}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folder.name}" and all its bookmarks? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteFolder}
        isLoading={deleteFolderMutation.isPending}
      />
    </div>
  );
};

export default BookmarkFolderDetailPage;
