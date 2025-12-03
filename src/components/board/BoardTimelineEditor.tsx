"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateTimelineEntry,
  useUpdateTimelineEntry,
} from "@/lib/hooks/use-timeline";
import { useUploadThing } from "@/lib/uploadthing";
import { cn, formatExactDate, getRelativeTime } from "@/lib/utils";
import type { BoardTimelineEntry } from "@/types";
import {
  ArrowCircleUpIcon,
  DiamondIcon,
  PencilSimpleLineIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isUploadingEditImages, setIsUploadingEditImages] = useState(false);
  const [editDragActive, setEditDragActive] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const editDropZoneRef = useRef<HTMLDivElement>(null);
  const createTimelineEntry = useCreateTimelineEntry(boardId);
  const updateTimelineEntry = useUpdateTimelineEntry(boardId);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      setIsUploadingImages(true);
    },
    onClientUploadComplete: (res: Array<{ url: string }>) => {
      setIsUploadingImages(false);
      const urls = res.map((file) => file.url);
      setUploadedImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    },
    onUploadError: (error: Error) => {
      setIsUploadingImages(false);
      const errorMessage = error.message.includes("FileSizeMismatch")
        ? "Image size exceeds the maximum limit of 4MB. Please choose a smaller image."
        : `Upload failed: ${error.message}`;
      toast.error(errorMessage);
    },
  });

  const { startUpload: startEditUpload } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      setIsUploadingEditImages(true);
    },
    onClientUploadComplete: (res: Array<{ url: string }>) => {
      setIsUploadingEditImages(false);
      const urls = res.map((file) => file.url);
      setEditingImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    },
    onUploadError: (error: Error) => {
      setIsUploadingEditImages(false);
      const errorMessage = error.message.includes("FileSizeMismatch")
        ? "Image size exceeds the maximum limit of 4MB. Please choose a smaller image."
        : `Upload failed: ${error.message}`;
      toast.error(errorMessage);
    },
  });

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
    if (!content.trim() && uploadedImages.length === 0) return;

    try {
      await createTimelineEntry.mutateAsync({
        content: content.trim(),
        action: "created",
        images: uploadedImages,
      });
      setNewEntryContent("");
      setUploadedImages([]);
      setManualShowEntry(false);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) {
        toast.error("Please select image files only");
        return;
      }

      await startUpload(imageFiles);
    },
    [startUpload],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        void handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFileSelect(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
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

  const handleEditFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) {
        toast.error("Please select image files only");
        return;
      }

      await startEditUpload(imageFiles);
    },
    [startEditUpload],
  );

  const handleEditDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setEditDragActive(true);
    } else if (e.type === "dragleave") {
      setEditDragActive(false);
    }
  }, []);

  const handleEditDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setEditDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        void handleEditFileSelect(e.dataTransfer.files);
      }
    },
    [handleEditFileSelect],
  );

  const handleEditFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    void handleEditFileSelect(e.target.files);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const removeEditImage = (index: number) => {
    setEditingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (images: string[], index: number) => {
    setViewingImages(images);
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : viewingImages.length - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < viewingImages.length - 1 ? prev + 1 : 0,
    );
  };

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!isImageViewerOpen || viewingImages.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImageIndex((prev) =>
          prev > 0 ? prev - 1 : viewingImages.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImageIndex((prev) =>
          prev < viewingImages.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "Escape") {
        setIsImageViewerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageViewerOpen, viewingImages.length]);

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
            <div className="relative z-10 flex-shrink-0">
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
                <div
                  ref={editDropZoneRef}
                  onDragEnter={handleEditDrag}
                  onDragLeave={handleEditDrag}
                  onDragOver={handleEditDrag}
                  onDrop={handleEditDrop}
                  className={cn(
                    "border-border bg-card rounded-lg border",
                    editDragActive && "border-primary border-2",
                    isUploadingEditImages && "opacity-50",
                  )}
                >
                  <div className="space-y-3 p-4">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      placeholder="Add a comment or update..."
                      disabled={disabled || isUploadingEditImages}
                      className="placeholder:text-muted-foreground min-h-[100px] w-full resize-none border-none bg-transparent text-sm outline-none"
                      autoFocus
                    />

                    {/* Editing images preview */}
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
                            <button
                              onClick={() => removeEditImage(idx)}
                              className="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drag overlay */}
                    {editDragActive && (
                      <div className="bg-primary/10 border-primary absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-center">
                          <ImageIcon className="text-primary mx-auto mb-2 h-8 w-8" />
                          <p className="text-primary text-sm font-medium">
                            Drop images here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-border bg-muted/30 flex items-center justify-between gap-2 border-t p-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditFileInputChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={disabled || isUploadingEditImages}
                        className="h-8 text-xs"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Add Images
                      </Button>
                      {editingImages.length > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {editingImages.length} image
                          {editingImages.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={isUploadingEditImages}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={
                          (!editingContent.trim() &&
                            editingImages.length === 0) ||
                          updateTimelineEntry.isPending ||
                          isUploadingEditImages
                        }
                        className="size-8 p-0"
                      >
                        <ArrowCircleUpIcon weight="light" className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-border bg-card overflow-hidden rounded-lg border">
                  <div className="space-y-0 p-4">
                    <div className="text-foreground prose prose-sm max-w-none text-sm whitespace-pre-wrap">
                      {entry.content}
                    </div>

                    {/* Images */}
                    {entry.images &&
                      Array.isArray(entry.images) &&
                      entry.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {entry.images.map((imageUrl: string, idx: number) => (
                            <div
                              key={idx}
                              className="bg-muted relative aspect-video cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90"
                              onClick={() =>
                                handleImageClick(entry.images ?? [], idx)
                              }
                            >
                              <img
                                src={imageUrl}
                                alt={`Image ${idx + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  console.error(
                                    "Failed to load image:",
                                    imageUrl,
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Edit button for own entries */}
                    {entry.userId === session?.user?.id && canEdit && (
                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStartEdit(entry)}
                          disabled={disabled}
                          className="h-8 text-xs"
                        >
                          <PencilSimpleLineIcon className="h-3.5 w-3.5" />
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
            <div className="relative z-10 flex-shrink-0">
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

              <div
                ref={dropZoneRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "border-border bg-card rounded-lg border",
                  dragActive && "border-primary border-2",
                  isUploadingImages && "opacity-50",
                )}
              >
                <div className="space-y-3 p-4">
                  <textarea
                    value={newEntryContent}
                    onChange={(e) => setNewEntryContent(e.target.value)}
                    placeholder="Add a comment or update..."
                    disabled={disabled || isUploadingImages}
                    className="placeholder:text-muted-foreground min-h-[100px] w-full resize-none border-none bg-transparent text-sm outline-none"
                    autoFocus
                  />

                  {/* Uploaded images preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((imageUrl, idx) => (
                        <div
                          key={idx}
                          className="bg-muted group relative aspect-video overflow-hidden rounded-lg"
                        >
                          <img
                            src={imageUrl}
                            alt={`Uploaded ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drag overlay */}
                  {dragActive && (
                    <div className="bg-primary/10 border-primary absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed">
                      <div className="text-center">
                        <ImageIcon className="text-primary mx-auto mb-2 h-8 w-8" />
                        <p className="text-primary text-sm font-medium">
                          Drop images here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-border bg-muted/30 flex items-center justify-between gap-2 border-t p-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || isUploadingImages}
                      className="h-7 gap-1.5 text-xs"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Add Images
                    </Button>
                    {uploadedImages.length > 0 && (
                      <span className="text-muted-foreground text-xs">
                        {uploadedImages.length} image
                        {uploadedImages.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSaveNewEntry(newEntryContent)}
                    disabled={
                      (!newEntryContent.trim() &&
                        uploadedImages.length === 0) ||
                      createTimelineEntry.isPending ||
                      isUploadingImages
                    }
                    className="size-8 p-0"
                  >
                    <ArrowCircleUpIcon weight="light" className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add new entry button at bottom */}
        {!showNewEntry && (
          <div className="relative flex justify-start pl-[6.5px]">
            <button
              onClick={handleAddNewEntry}
              disabled={disabled}
              className="relative flex size-5 cursor-pointer items-center justify-center transition-all ease-out hover:opacity-80 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DiamondIcon
                weight="light"
                className="text-foreground/60 size-5"
              />
              <PlusIcon className="text-muted-foreground absolute size-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="h-auto max-h-[95vh] w-auto max-w-[95vw] border-none bg-black/95 p-0">
          <DialogTitle className="sr-only">
            Image Viewer -{" "}
            {viewingImages.length > 0
              ? `Image ${currentImageIndex + 1} of ${viewingImages.length}`
              : "Viewing image"}
          </DialogTitle>
          <div className="relative flex h-full min-h-[70vh] w-full items-center justify-center">
            {viewingImages.length > 0 && (
              <>
                <img
                  src={viewingImages[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="max-h-[90vh] max-w-full object-contain"
                />

                {/* Navigation buttons */}
                {viewingImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      {currentImageIndex + 1} / {viewingImages.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
