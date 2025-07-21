"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { bookmarkApi } from '@/lib/api';
import type { Bookmark } from '@/types';
import { Edit, ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditBookmarkDialog from './EditBookmarkDialog';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onUpdate: () => void;
}

const BookmarkItem = ({ bookmark, onUpdate }: BookmarkItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showEditBookmark, setShowEditBookmark] = useState(false);

  const handleDeleteBookmark = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }

    try {
      const response = await bookmarkApi.delete(bookmark._id!);

      if (response.data) {
        onUpdate();
      } else {
        console.error('Failed to delete bookmark:', response.error);
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleOpenLink = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="group flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={handleOpenLink}
        >
          {bookmark.favicon && (
            <img
              src={bookmark.favicon}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0 max-w-[200px] border">
            <p className="text-sm font-medium truncate">{bookmark.title}</p>
            {bookmark.description && (
              <p className="text-xs text-muted-foreground truncate">{bookmark.description}</p>
            )}
          </div>
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>

          {showActions && (
            <div
              className="absolute right-0 top-6 bg-background border rounded-md shadow-lg py-1 z-20"
              onMouseLeave={() => setShowActions(false)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditBookmark(true);
                  setShowActions(false);
                }}
              >
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-1 text-xs text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDeleteBookmark();
                  setShowActions(false);
                }}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <EditBookmarkDialog
        open={showEditBookmark}
        onOpenChange={setShowEditBookmark}
        bookmark={bookmark}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default BookmarkItem; 