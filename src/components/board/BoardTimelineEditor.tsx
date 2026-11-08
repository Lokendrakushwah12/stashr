"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import ImageModal from "@/components/ui/image-modal";
import {
  useCreateTimelineEntry,
  useDeleteTimelineEntry,
  useUpdateTimelineEntry,
} from "@/lib/hooks/use-timeline";
import { useUploadThing } from "@/lib/uploadthing";
import { cn, formatExactDate, getRelativeTime } from "@/lib/utils";
import type { BoardTimelineEntry } from "@/types";
import {
  Pen,
  TrashBinTrash,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { DiamondPlus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import MarkdownComposer from "./MarkdownComposer";
import { MarkdownPreview } from "./MarkdownPreview";

interface BoardTimelineEditorProps {
  boardId: string;
  timelineEntries: BoardTimelineEntry[];
  disabled?: boolean;
  userRole?: "owner" | "editor" | "viewer";
}

export default function BoardTimelineEditor({
  boardId,
  timelineEntries,
  disabled = false,
  userRole = "viewer",
}: BoardTimelineEditorProps) {
  const { data: session } = useSession();
  const [manualShowEntry, setManualShowEntry] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const createTimelineEntry = useCreateTimelineEntry(boardId);
  const updateTimelineEntry = useUpdateTimelineEntry(boardId);
  const deleteTimelineEntry = useDeleteTimelineEntry(boardId);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deletingEntryId) return;
    try {
      await deleteTimelineEntry.mutateAsync(deletingEntryId);
      toast.success("Entry deleted");
      setDeletingEntryId(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  // Composer images upload here and go inline, where they were pasted.
  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (error: Error) => {
      const errorMessage = error.message.includes("FileSizeMismatch")
        ? "Image size exceeds the maximum limit of 4MB. Please choose a smaller image."
        : `Upload failed: ${error.message}`;
      toast.error(errorMessage);
    },
  });
  const uploadImages = async (files: File[]) =>
    ((await startUpload(files)) ?? []).map((file) => file.url);

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  // Show entry form when there are no entries OR when manually triggered
  const showNewEntry = timelineEntries.length === 0 || manualShowEntry;

  const handleAddNewEntry = () => {
    setManualShowEntry(true);
  };

  const handleSaveNewEntry = async (content: string) => {
    if (!content.trim()) return;

    try {
      await createTimelineEntry.mutateAsync({
        content: content.trim(),
        action: "created",
        images: [],
      });
      setNewEntryContent("");
      setManualShowEntry(false);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleStartEdit = (entry: BoardTimelineEntry) => {
    setEditingEntryId(entry._id);
    setEditingContent(entry.content);
    setEditingImages(entry.images ?? []);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingContent("");
    setEditingImages([]);
  };

  const handleSaveEdit = async () => {
    if (!editingEntryId) return;
    if (!editingContent.trim() && editingImages.length === 0) return;

    try {
      await updateTimelineEntry.mutateAsync({
        entryId: editingEntryId,
        content: editingContent.trim(),
        images: editingImages,
      });
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const removeEditImage = (index: number) => {
    setEditingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canEdit = userRole === "owner" || userRole === "editor";

  const getRoleInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "ring ring-yellow-500/50";
      case "editor":
        return "ring ring-blue-500/50";
      case "viewer":
        return "ring ring-gray-400/50";
      default:
        return "ring ring-gray-400/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="bg-border absolute top-0 bottom-0 left-4 w-px" />

        {timelineEntries.map((entry, index) => (
          <div key={entry._id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Avatar */}
            <div className="relative z-10 shrink-0">
              <Avatar
                className={cn(
                  "border-background size-8 rounded-lg p-0.5",
                  getRoleColor(entry.userRole),
                )}
              >
                <AvatarImage
                  className="overflow-hidden rounded-md"
                  src={entry.userImage ?? ""}
                  alt={entry.userName}
                />
                <AvatarFallback className="rounded-sm text-xs">
                  {getRoleInitials(entry.userName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium">{entry.userName}</span>
                <span className="text-muted-foreground text-xs capitalize">
                  {entry.userRole}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground cursor-help text-xs">
                        • {getRelativeTime(entry.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatExactDate(entry.createdAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Content area */}
              {editingEntryId === entry._id ? (
                <MarkdownComposer
                  value={editingContent}
                  onChange={setEditingContent}
                  onSubmit={() => void handleSaveEdit()}
                  placeholder="Add a comment or update..."
                  disabled={disabled}
                  submitDisabled={
                    (!editingContent.trim() && editingImages.length === 0) ||
                    updateTimelineEntry.isPending
                  }
                  onCancel={handleCancelEdit}
                  onUploadImages={uploadImages}
                >
                  {/* Images attached before they went inline */}
                  {editingImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {editingImages.map((imageUrl, idx) => (
                        <div
                          key={idx}
                          className="bg-muted group relative aspect-video overflow-hidden rounded-lg"
                        >
                          <img
                            src={imageUrl}
                            alt={`Edit ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEditImage(idx)}
                            className="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </MarkdownComposer>
              ) : (
                <div
                  data-note
                  data-mine={entry.userId === session?.user?.id || undefined}
                  className="border-border overflow-hidden rounded-lg border"
                >
                  <div className="space-y-0 p-4">
                    <MarkdownPreview
                      content={entry.content}
                      className="text-foreground wrap-break-word"
                      emptyState=""
                    />

                    {/* Images */}
                    {entry.images &&
                      Array.isArray(entry.images) &&
                      entry.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {entry.images.map((imageUrl: string, idx: number) => (
                            <div
                              key={idx}
                              className="bg-muted relative aspect-video overflow-hidden rounded-lg transition-opacity hover:opacity-90"
                            >
                              <ImageModal
                                src={imageUrl}
                                alt={`Image ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Edit + Delete for own entries */}
                    {entry.userId === session?.user?.id && canEdit && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructiveSecondary"
                          onClick={() => setDeletingEntryId(entry._id)}
                          disabled={disabled}
                          className="text-destructive hover:text-destructive h-8 text-xs"
                        >
                          <TrashBinTrash size={14} />
                          Delete
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStartEdit(entry)}
                          disabled={disabled}
                          className="h-8 text-xs"
                        >
                          <Pen size={14} className="text-muted-foreground" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* New entry form */}
        {showNewEntry && (
          <div className="relative flex gap-4 pb-6">
            {/* Avatar */}
            <div className="relative z-10 shrink-0">
              <Avatar className="border-background size-8 rounded-md border-2">
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? ""}
                />
                <AvatarFallback className="rounded-sm text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {session?.user?.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {userRole}
                </span>
                <span className="text-muted-foreground text-xs">• Now</span>
              </div>

              <MarkdownComposer
                value={newEntryContent}
                onChange={setNewEntryContent}
                onSubmit={() => void handleSaveNewEntry(newEntryContent)}
                placeholder="Add a comment or update..."
                disabled={disabled}
                submitDisabled={
                  !newEntryContent.trim() || createTimelineEntry.isPending
                }
                onUploadImages={uploadImages}
              />
            </div>
          </div>
        )}

        {/* Add new entry button at bottom */}
        {!showNewEntry && (
          <div className="relative h-6">
            {/* Centred on the timeline line (left-4, 1px wide). */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddNewEntry}
              disabled={disabled}
              className="absolute top-0 left-[16.5px] flex size-6 -translate-x-1/2 cursor-pointer items-center justify-center p-0 transition-all ease-out hover:opacity-80 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DiamondPlus
                strokeWidth={1}
                className="text-muted-foreground size-5"
              />
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deletingEntryId}
        onOpenChange={(open) => !open && setDeletingEntryId(null)}
        title="Delete entry"
        description="Are you sure you want to delete this timeline entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => void handleConfirmDelete()}
        isLoading={deleteTimelineEntry.isPending}
      />
    </div>
  );
}
