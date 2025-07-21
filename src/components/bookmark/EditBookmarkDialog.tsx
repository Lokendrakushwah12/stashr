"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBookmark } from '@/lib/hooks/use-bookmarks';
import type { Bookmark } from '@/types';
import { useEffect, useState } from "react";

interface EditBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: Bookmark;
  onSuccess: () => void;
}

const EditBookmarkDialog = ({ open, onOpenChange, bookmark, onSuccess }: EditBookmarkDialogProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  // Use React Query mutation
  const updateBookmarkMutation = useUpdateBookmark();

  useEffect(() => {
    if (open && bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setDescription(bookmark.description ?? '');
    }
  }, [open, bookmark]);

  // Cleanup effect to ensure dialog elements are properly removed
  useEffect(() => {
    return () => {
      // Cleanup any remaining dialog overlays when component unmounts
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
      overlays.forEach(overlay => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = 'none';
          overlay.style.pointerEvents = 'none';
        }
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bookmarkData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
      };

      await updateBookmarkMutation.mutateAsync({ id: bookmark._id!, data: bookmarkData });
      
      // Close dialog and call success callback
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Error is handled by React Query
      console.error('Failed to update bookmark:', error);
    }
  };

  const handleClose = () => {
    if (!updateBookmarkMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Update your bookmark&apos;s title, URL, and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bookmark title"
              disabled={updateBookmarkMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={updateBookmarkMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter bookmark description (optional)"
              disabled={updateBookmarkMutation.isPending}
              rows={3}
            />
          </div>

          {updateBookmarkMutation.error && (
            <p className="text-sm text-destructive">
              {updateBookmarkMutation.error.message || 'Failed to update bookmark'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateBookmarkMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateBookmarkMutation.isPending || !title.trim() || !url.trim()}>
              {updateBookmarkMutation.isPending ? 'Updating...' : 'Update Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookmarkDialog; 