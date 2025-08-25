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
import { useCreateBookmark } from '@/lib/hooks/use-bookmarks';
import { useState } from "react";

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  onSuccess: () => void;
}

const AddBookmarkDialog = ({ open, onOpenChange, folderId, onSuccess }: AddBookmarkDialogProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  // Use React Query mutation
  const createBookmarkMutation = useCreateBookmark();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const bookmarkData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        folderId,
      };

      await createBookmarkMutation.mutateAsync(bookmarkData);

      // Reset form
      setTitle('');
      setUrl('');
      setDescription('');

      // Close dialog and call success callback
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Error is handled by React Query
      console.error('Failed to create bookmark:', error);
    }
  };

  const handleClose = () => {
    if (!createBookmarkMutation.isPending) {
      setTitle('');
      setUrl('');
      setDescription('');
      onOpenChange(false);
    }
  };

  // Auto-fetch page title when URL is entered
  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);

    if (newUrl.trim() && !title.trim()) {
      try {
        // Try to extract title from URL for better UX
        const urlObj = new URL(newUrl.trim());
        const domain = urlObj.hostname.replace('www.', '');
        setTitle(domain);
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Add a new bookmark to your folder. Enter the title, URL, and optional description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 bg-background border border-border/70 p-4 rounded-xl">
          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                disabled={createBookmarkMutation.isPending}
                required
              />
            </div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bookmark title"
              disabled={createBookmarkMutation.isPending}
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
              disabled={createBookmarkMutation.isPending}
              rows={3}
            />
          </div>

          {createBookmarkMutation.error && (
            <p className="text-sm text-destructive">
              {createBookmarkMutation.error.message || 'Failed to create bookmark'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createBookmarkMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBookmarkMutation.isPending || !title.trim() || !url.trim()}>
              {createBookmarkMutation.isPending ? 'Creating...' : 'Create Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookmarkDialog; 