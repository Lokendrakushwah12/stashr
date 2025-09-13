"use client";

import AddBookmarkDialog from '@/components/bookmark/AddBookmarkDialog';
import BookmarkCard from '@/components/bookmark/BookmarkCard';
import EditBookmarkDialog from '@/components/bookmark/EditBookmarkDialog';
import EditFolderDialog from '@/components/bookmark/EditFolderDialog';
import { Button } from "@/components/ui/button";
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteBookmark, useDeleteFolder, useFolder } from '@/lib/hooks/use-bookmarks';
import type { Bookmark } from '@/types';
import { ArrowsClockwiseIcon, PencilSimpleLineIcon, PlusIcon, ShareFatIcon, TrashIcon } from "@phosphor-icons/react";
import { ArrowLeft, MoreVertical, Plus, RefreshCw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const FolderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use React Query for data fetching
  const {
    data: folderResponse,
    isLoading,
    error,
    refetch
  } = useFolder(folderId);

  const folder = folderResponse?.data?.folder;

  // Use React Query mutations
  const deleteBookmarkMutation = useDeleteBookmark();
  const deleteFolderMutation = useDeleteFolder();

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      await deleteBookmarkMutation.mutateAsync({ id: bookmarkId, folderId });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleDeleteFolder = () => {
    setDropdownOpen(false);
    setShowDeleteFolderConfirm(true);
  };

  const confirmDeleteFolder = async () => {
    try {
      await deleteFolderMutation.mutateAsync(folderId);
      router.push('/');
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  if (error) {
    return (
      <div className="max-w-[86rem] px-5 mx-auto flex flex-col items-center justify-center min-h-[90vh] text-center">
        <div className="max-w-md">
          <p className="text-destructive mb-4">{error.message || 'Folder not found'}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="max-w-[86rem] px-5 mx-auto flex flex-col items-center justify-center min-h-[90vh] text-center">
        <div className="max-w-md">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          onClick={() => {
            router.push('/');
          }}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <ArrowsClockwiseIcon weight="duotone" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button onClick={() => setShowAddBookmark(true)}>
            <PlusIcon weight="duotone" className="h-4 w-4" />
            Add Bookmark
          </Button>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <DropdownMenuItem
                onClick={() => {
                  const url = `${window.location.origin}/public/folder/${folderId}`;
                  navigator.clipboard?.writeText(url).catch(() => { void 0; });
                  window.open(url, "_blank");
                }}
                className="cursor-pointer rounded-lg"
              >
                <ShareFatIcon weight="duotone" className="h-4 w-4" />
                Share Public Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDropdownOpen(false);
                  setShowEditFolder(true);
                }}
                className="cursor-pointer rounded-lg"
              >
                <PencilSimpleLineIcon weight="duotone" className="h-4 w-4" />
                Edit Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteFolder}
                className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
              >
                <TrashIcon weight="duotone" className="h-4 w-4 text-destructive" />
                {deleteFolderMutation.isPending ? 'Deleting...' : 'Delete Folder'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: folder.color }}
            />
            {folder.name}
          </h1>
          {folder.description && (
            <p className="text-muted-foreground mt-2">{folder.description}</p>
          )}
        </div>
      </div>

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your bookmarks...</p>
        </div>
      ) : (
        folder.bookmarks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className='relative h-32 w-full sm:w-[25rem]'>
              <div className='absolute bottom-0 w-full h-16 bg-gradient-to-t from-background to-transparent z-[99]' />
              <div className="border border-[#ddd] dark:border-white/10 w-full h-[60%] bg-white/60 dark:bg-muted/60 z-20 p-2 backdrop-blur-2xl rounded-t-2xl absolute bottom-0" >
                <div className="w-[50%] h-[50%] bg-black/5 dark:bg-white/10 rounded-lg mb-2" />
                <div className="w-full h-[50%] bg-black/5 dark:bg-white/10 rounded-lg" />
              </div>
              <div className="border border-[#ddd] group-hover:-rotate-2 transition-all dark:border-white/10 w-[95%] h-[60%] scale-95 bg-white/50 dark:bg-muted/50 z-10 backdrop-blur-2xl p-2 rounded-t-2xl absolute bottom-4 left-1/2 -translate-x-1/2" />
              <div className="border border-[#ddd] group-hover:rotate-2 transition-all dark:border-white/10 w-[85%] h-[60%] scale-90 bg-white/40 dark:bg-muted/40 z-0 p-2 rounded-t-2xl absolute bottom-8 left-1/2 -translate-x-1/2" />
            </div>
            <h3 className="text-2xl font-medium mb-2">You don&apos;t have any bookmarks yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by adding your first bookmark to this folder.
            </p>
            <Button variant="outline" onClick={() => setShowAddBookmark(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Bookmark
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folder.bookmarks?.map((bookmark) => (
              <BookmarkCard
                key={`${bookmark._id}-${editingBookmark?._id === bookmark._id ? 'editing' : 'normal'}`}
                bookmark={bookmark}
                onEdit={setEditingBookmark}
                onDelete={handleDeleteBookmark}
              />
            ))}
          </div>
        )
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

      <EditFolderDialog
        open={showEditFolder}
        onOpenChange={setShowEditFolder}
        folder={folder}
        onSuccess={() => {
          setShowEditFolder(false);
          // React Query will automatically refetch after mutation
        }}
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

export default FolderDetailPage; 