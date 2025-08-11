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
import { useCreateFolder } from '@/lib/hooks/use-bookmarks';
import { useState } from "react";

interface AddFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

const AddFolderDialog = ({ open, onOpenChange, onSuccess }: AddFolderDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');

  // Use React Query mutation
  const createFolderMutation = useCreateFolder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const folderData = {
        name: name.trim(),
        description: description.trim(),
        color,
      };
      
      await createFolderMutation.mutateAsync(folderData);
      
      // Reset form
      setName('');
      setDescription('');
      setColor('#3B82F6');
      
      // Close dialog and call success callback
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Error is handled by React Query
      console.error('Failed to create folder:', error);
    }
  };

  const handleClose = () => {
    if (!createFolderMutation.isPending) {
      setName('');
      setDescription('');
      setColor('#3B82F6');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your bookmarks. You can customize the name, description, and color.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-black p-4 rounded-xl">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              disabled={createFolderMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter folder description (optional)"
              disabled={createFolderMutation.isPending}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {predefinedColors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-xl border-2 ${
                    color === colorOption ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  disabled={createFolderMutation.isPending}
                />
              ))}
            </div>
          </div>

          {createFolderMutation.error && (
            <p className="text-sm text-destructive">
              {createFolderMutation.error.message || 'Failed to create folder'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createFolderMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFolderMutation.isPending || !name.trim()}>
              {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFolderDialog; 