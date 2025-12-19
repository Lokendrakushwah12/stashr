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
import { useUpdateFolder } from "@/lib/hooks/use-bookmarks";
import type { Folder } from "@/types";
import { useEffect, useState } from "react";

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder;
  onSuccess: () => void;
}

const predefinedColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

const EditFolderDialog = ({
  open,
  onOpenChange,
  folder,
  onSuccess,
}: EditFolderDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");

  // Use React Query mutation
  const updateFolderMutation = useUpdateFolder();

  useEffect(() => {
    if (open && folder) {
      setName(folder.name);
      setDescription(folder.description ?? "");
      setColor(folder.color ?? "#3B82F6");
    }
  }, [open, folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const folderData = {
        name: name.trim(),
        description: description.trim(),
        color,
      };

      await updateFolderMutation.mutateAsync({
        id: folder._id!,
        data: folderData,
      });

      // Close dialog and call success callback
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Error is handled by React Query
      console.error("Failed to update folder:", error);
    }
  };

  const handleClose = () => {
    if (!updateFolderMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Update your folder&apos;s name, description, and color.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="bg-background border-border/70 space-y-4 rounded-xl border p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              disabled={updateFolderMutation.isPending}
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
              disabled={updateFolderMutation.isPending}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`h-8 w-8 rounded-xl border-2 ${
                    color === colorOption
                      ? "border-foreground"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  disabled={updateFolderMutation.isPending}
                />
              ))}
            </div>
          </div>

          {updateFolderMutation.error && (
            <p className="text-destructive text-sm">
              {updateFolderMutation.error.message || "Failed to update folder"}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateFolderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              isLoading={updateFolderMutation.isPending}
            >
              Update Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderDialog;
