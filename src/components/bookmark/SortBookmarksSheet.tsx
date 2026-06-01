"use client";

import BookmarkFavicon from "@/components/bookmark/BookmarkFavicon";
import { Button } from "@/components/ui/button";
import { folderKeys, useUpdateBookmark } from "@/lib/hooks/use-bookmarks";
import { cn } from "@/lib/utils";
import type { Bookmark } from "@/types";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { GripVertical, Loader2, X } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SortBookmarksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  bookmarks: Bookmark[];
}

interface Draft extends Bookmark {
  _id: string; // narrow to required
}

export default function SortBookmarksSheet({
  open,
  onOpenChange,
  folderId,
  bookmarks,
}: SortBookmarksSheetProps) {
  const queryClient = useQueryClient();
  const updateBookmark = useUpdateBookmark();
  const [items, setItems] = useState<Draft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize / reset the draft whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    setItems(
      bookmarks
        .filter((b): b is Bookmark & { _id: string } => !!b._id)
        .map((b) => ({ ...b })),
    );
  }, [open, bookmarks]);

  const toggleInactive = (id: string) => {
    setItems((prev) =>
      prev.map((b) => (b._id === id ? { ...b, inactive: !b.inactive } : b)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const originalById = new Map(
        bookmarks
          .filter((b): b is Bookmark & { _id: string } => !!b._id)
          .map((b) => [b._id, b]),
      );

      const inactiveChanges = items.filter((b) => {
        const orig = originalById.get(b._id);
        return orig && (orig.inactive ?? false) !== (b.inactive ?? false);
      });

      const originalOrder = bookmarks
        .filter((b): b is Bookmark & { _id: string } => !!b._id)
        .map((b) => b._id)
        .join(",");
      const newOrder = items.map((b) => b._id).join(",");
      const orderChanged = originalOrder !== newOrder;

      if (orderChanged) {
        const res = await fetch(`/api/folders/${folderId}/bookmark-order`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookmarkIds: items.map((b) => b._id) }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to reorder bookmarks");
        }
      }

      for (const b of inactiveChanges) {
        await updateBookmark.mutateAsync({
          id: b._id,
          data: { inactive: b.inactive ?? false },
        });
      }

      void queryClient.invalidateQueries({
        queryKey: folderKeys.detail(folderId),
      });

      if (orderChanged || inactiveChanges.length > 0) {
        toast.success("Bookmarks updated");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save sort/inactive changes", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "bg-background fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-200",
          )}
        >
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold">
                Sort bookmarks
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-muted-foreground text-xs">
                Drag to reorder. Toggle visibility for public links.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {items.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                No bookmarks to sort.
              </p>
            ) : (
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                className="space-y-2"
              >
                {items.map((b) => (
                  <SortRow
                    key={b._id}
                    bookmark={b}
                    onToggleInactive={() => toggleInactive(b._id)}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SortRow({
  bookmark,
  onToggleInactive,
}: {
  bookmark: Draft;
  onToggleInactive: () => void;
}) {
  const controls = useDragControls();
  const isInactive = bookmark.inactive === true;
  return (
    <Reorder.Item
      value={bookmark}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "bg-card flex items-center gap-2 rounded-lg border p-2 select-none",
        isInactive && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <BookmarkFavicon
        url={bookmark.url}
        favicon={bookmark.favicon}
        alt=""
        className="h-7 w-7 shrink-0 rounded-md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{bookmark.title}</p>
        <p className="text-muted-foreground truncate text-xs">{bookmark.url}</p>
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={isInactive}
          onChange={onToggleInactive}
          className="h-4 w-4 cursor-pointer"
        />
        <span className="text-muted-foreground">Inactive</span>
      </label>
    </Reorder.Item>
  );
}
