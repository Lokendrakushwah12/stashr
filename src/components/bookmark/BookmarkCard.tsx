"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Bookmark } from "@/types";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import {
  Copy,
  Pen,
  TrashBinTrash,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StashrLogo } from "../ui/icons";

interface ExtractionResult {
  success: boolean;
  imageUrl: string;
  fallbackUsed: boolean;
  error?: string;
  debug?: {
    strategy: string;
    extractedUrl?: string;
    validationPassed?: boolean;
  };
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
  showDropdown?: boolean;
}

const BookmarkCard = ({
  bookmark,
  onEdit,
  onDelete,
  showDropdown = true,
}: BookmarkCardProps) => {
  const [metaImageUrl, setMetaImageUrl] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Initialize with stored meta image or fallback, then try to extract if needed
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    const initializeImage = async () => {
      if (bookmark.metaImage && bookmark.metaImage !== "") {
        setMetaImageUrl(bookmark.metaImage);
        setIsExtracting(false);
        return;
      }

      setMetaImageUrl("");
      setIsExtracting(true);

      try {
        const response = await fetch(
          `/api/meta-image?url=${encodeURIComponent(bookmark.url)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`status ${response.status}`);
        const result = (await response.json()) as ExtractionResult;

        if (isCancelled) return;

        if (result.success && !result.fallbackUsed && result.imageUrl) {
          setMetaImageUrl(result.imageUrl);
        } else {
          // Keep fallback
          setMetaImageUrl("");
        }
      } catch (_error) {
        if (!isCancelled) {
          // On error, just show fallback and stop
          setMetaImageUrl("");
        }
      } finally {
        if (!isCancelled) {
          setIsExtracting(false);
        }
      }
    };

    void initializeImage();

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [bookmark.metaImage, bookmark.url]);

  const handleDelete = () => {
    setDropdownOpen(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(bookmark._id!);
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setDropdownOpen(false);
    onEdit(bookmark);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      toast.success("Link copied to clipboard!");
      setDropdownOpen(false);
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  return (
    <>
      <Card className="dark:bg-card group relative z-10 mb-2 overflow-hidden rounded-2xl bg-white p-0 transition-all">
        <CardContent className="w-full p-1">
          <div className="flex w-full items-center p-1 pb-0 sm:p-2 sm:pb-0">
            <Link
              href={bookmark.url}
              target="_blank"
              className={showDropdown ? "-mr-8 w-full" : "w-full"}
            >
              <div className="flex w-full items-center gap-2 sm:gap-4">
                <img
                  src={
                    bookmark.favicon ??
                    `https://img.logo.dev/${new URL(bookmark.url).hostname}?token=pk_IgdfjsfTRDC5pflfc9nf1w&retina=true`
                  }
                  alt="Favicon"
                  className="h-9 w-9 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.logo.dev/${new URL(bookmark.url).hostname}?token=pk_IgdfjsfTRDC5pflfc9nf1w&retina=true`;
                  }}
                />
                <div className="w-full overflow-hidden">
                  <h3 className="truncate font-semibold">{bookmark.title}</h3>
                  <p className="text-muted-foreground truncate text-sm">
                    {bookmark.url}
                  </p>
                  {bookmark.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {bookmark.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
            {showDropdown && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="size-9">
                    <DotsVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-50 w-40 rounded-xl"
                >
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="cursor-pointer rounded-lg"
                  >
                    <Pen className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="cursor-pointer rounded-lg"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
                  >
                    <TrashBinTrash className="text-destructive h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Meta Image Preview */}
          <div className="bg-background relative mt-4 overflow-hidden rounded-xl border">
            <div className="relative h-48 w-full overflow-hidden">
              {/* Show image if available, otherwise show unavailable */}
              {metaImageUrl ? (
                <img
                  src={metaImageUrl}
                  alt={`Preview of ${bookmark.title}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  // onLoad={() => console.log(`✅ Image loaded: ${metaImageUrl}`)}
                  onError={(e) => {
                    console.error(
                      `❌ Image failed to load: ${metaImageUrl}`,
                      e,
                    );
                    e.currentTarget.style.display = "none";
                    // Show fallback text
                    const fallbackDiv = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fallbackDiv) {
                      fallbackDiv.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              {/* Fallback text when no image or image fails */}
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ display: metaImageUrl ? "none" : "flex" }}
              >
                <div className="flex flex-col items-center justify-center p-4">
                  <StashrLogo width={44} className="text-primary/50" />
                  <p className="text-muted-foreground mt-6 text-sm">
                    Preview unavailable
                  </p>
                </div>
              </div>

              {/* Overlay on hover */}
              <div className="group-hover:bg-accent/10 pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300" />

              {/* Extraction indicator */}
              {isExtracting && (
                <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                  Extracting...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Bookmark"
        description="Are you sure you want to delete this bookmark? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default BookmarkCard;
