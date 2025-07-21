"use client";

import AddBookmarkDialog from '@/components/bookmark/AddBookmarkDialog';
import BookmarkCard from '@/components/bookmark/BookmarkCard';
import EditBookmarkDialog from '@/components/bookmark/EditBookmarkDialog';
import EditFolderDialog from '@/components/bookmark/EditFolderDialog';
import { Button } from "@/components/ui/button";
import { useFolder, useDeleteBookmark, useDeleteFolder } from '@/lib/hooks/use-bookmarks';
import type { Bookmark } from '@/types';
import { ArrowLeft, Edit, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const FolderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  // Use React Query for data fetching
  const { 
    data: folder, 
    isLoading, 
    error, 
    refetch 
  } = useFolder(folderId);

  // Use React Query mutations
  const deleteBookmarkMutation = useDeleteBookmark();
  const deleteFolderMutation = useDeleteFolder();

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      await deleteBookmarkMutation.mutateAsync(bookmarkId);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleDeleteFolder = async () => {
    if (!confirm('Are you sure you want to delete this folder and all its bookmarks?')) {
      return;
    }

    try {
      await deleteFolderMutation.mutateAsync(folderId);
      router.push('/');
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  if (error) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[90vh] text-center">
        <div className="max-w-md">
          <p className="text-destructive mb-4">{error.message || 'Folder not found'}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[90vh] text-center">
        <div className="max-w-md">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 mt-12 min-h-screen">
      {/* Header */}
      <Button
        onClick={() => router.push('/')}
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowEditFolder(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Folder
          </Button>
          <Button
            onClick={handleDeleteFolder}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={deleteFolderMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteFolderMutation.isPending ? 'Deleting...' : 'Delete Folder'}
          </Button>
          <Button onClick={() => setShowAddBookmark(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        </div>
      </div>

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your bookmarks...</p>
        </div>
      ) : (
        folder.bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by adding your first bookmark to this folder.
            </p>
            <Button onClick={() => setShowAddBookmark(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Bookmark
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folder.bookmarks.map((bookmark) => (
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
    </div>
  );
};

export default FolderDetailPage; 