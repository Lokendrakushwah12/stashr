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
import { bookmarkApi } from '@/lib/api';
import type { Bookmark } from '@/types';
import { useEffect, useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setDescription(bookmark.description ?? '');
      setError('');
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
    setLoading(true);
    setError('');

    try {
      const bookmarkData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
      };

      const response = await bookmarkApi.update(bookmark._id!, bookmarkData);

      if (response.data) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(response.error ?? 'Failed to update bookmark');
      }
    } catch {
      setError('An error occurred while updating bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      // Ensure proper cleanup and focus restoration
      setError('');
      onOpenChange(false);

      // Force cleanup of any remaining dialog elements
      setTimeout(() => {
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
        overlays.forEach(overlay => {
          if (overlay instanceof HTMLElement) {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
          }
        });
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Update your bookmark details.
          </DialogDescription>
        </DialogHeader>

        <form className='p-3 pt-0 bg-background rounded-xl' onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit-bookmark-url">URL *</Label>
              <Input
                id="edit-bookmark-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-bookmark-title">Title *</Label>
              <Input
                id="edit-bookmark-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter bookmark title"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-bookmark-description">Description</Label>
              <Input
                id="edit-bookmark-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !url.trim()}>
              {loading ? 'Updating...' : 'Update Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookmarkDialog; 