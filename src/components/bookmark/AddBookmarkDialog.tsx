"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { bookmarkApi } from '@/lib/api';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookmarkData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        folderId,
      };

      const response = await bookmarkApi.create(bookmarkData);

      if (response.data) {
        onSuccess();
        onOpenChange(false);
        setTitle('');
        setUrl('');
        setDescription('');
      } else {
        setError(response.error ?? 'Failed to create bookmark');
      }
    } catch {
      setError('An error occurred while creating bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setUrl('');
      setDescription('');
      setError('');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Add a new bookmark to this folder.
          </DialogDescription>
        </DialogHeader>
        
        <form className='p-3 pt-0 bg-background rounded-xl' onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="bookmark-url">URL *</Label>
              <Input
                id="bookmark-url"
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bookmark-title">Title *</Label>
              <Input
                id="bookmark-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter bookmark title"
                required
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bookmark-description">Description</Label>
              <Input
                id="bookmark-description"
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
              {loading ? 'Adding...' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookmarkDialog; 