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
import { useCreateBoard } from "@/lib/hooks/use-boards";
import { useState } from "react";

interface AddBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddBoardDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddBoardDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createBoardMutation = useCreateBoard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      await createBoardMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // Reset form
      setName("");
      setDescription("");

      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new board to organize your ideas and concepts.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="bg-background border-border/70 space-y-4 rounded-xl border p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter board name..."
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              maxLength={500}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              isLoading={createBoardMutation.isPending}
            >
              Create Board
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
