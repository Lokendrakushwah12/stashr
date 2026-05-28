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
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlanLimitInfo } from "@/components/upgrade-dialog";
import type { Team } from "@/lib/contexts/team-context";
import { useState } from "react";
import { toast } from "sonner";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (team: Team) => void | Promise<void>;
  onLimit: (info: PlanLimitInfo) => void;
  handleApiResponse: <T>(
    res: Response,
    onLimit: (info: PlanLimitInfo) => void,
  ) => Promise<T>;
  /** When true, dialog cannot be dismissed without creating (onboarding mode) */
  required?: boolean;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onCreated,
  onLimit,
  handleApiResponse,
  required = false,
}: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setLogoUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logoUrl }),
      });
      const data = await handleApiResponse<{ team: Team }>(res, onLimit);
      toast.success("Team created");
      await onCreated(data.team);
      reset();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create team";
      // PlanLimitError already shown via onLimit; suppress toast in that case
      if (!msg.toLowerCase().includes("plan limit")) toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (required && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {required ? "Create your team" : "Create a new team"}
            </DialogTitle>
            <DialogDescription className="px-3 pt-1">
              {required
                ? "Set up your workspace to start organizing boards and bookmarks."
                : "Teams group your boards, bookmarks, and members."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-3">
            <div className="flex flex-col items-center gap-2">
              <ImageUpload
                currentImage={logoUrl}
                onUploadComplete={(url) => setLogoUrl(url)}
                onRemove={() => setLogoUrl("")}
                fallbackText={name.charAt(0).toUpperCase() || "T"}
                size="md"
              />
              <span className="text-muted-foreground text-xs">
                Team logo (optional)
              </span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                placeholder="Acme Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={80}
              />
            </div>
          </div>
          <DialogFooter className="p-3 pt-0">
            {!required && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              isLoading={submitting}
              disabled={!name.trim()}
            >
              Create team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
