"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder } from '@/types';
import { FolderOpen, MoreVertical, Edit, Trash2, Plus } from 'lucide-react';
import AddBookmarkDialog from './AddBookmarkDialog';
import EditFolderDialog from './EditFolderDialog';
import BookmarkItem from './BookmarkItem';

interface FolderCardProps {
  folder: Folder;
  onUpdate: () => void;
}

const FolderCard = ({ folder, onUpdate }: FolderCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteFolder = async () => {
    if (!confirm('Are you sure you want to delete this folder and all its bookmarks?')) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folder._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      } else {
        console.error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  return (
    <>
      <Card 
        className="group relative hover:shadow-lg transition-all duration-200 cursor-pointer"
        style={{ borderTopColor: folder.color }}
      >
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseLeave={() => setShowActions(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-background border rounded-md shadow-lg py-1 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddBookmark(true);
                  setShowActions(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditFolder(true);
                  setShowActions(false);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Folder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-1 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder();
                  setShowActions(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <CardHeader 
          className="pb-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: folder.color }}
            />
            <FolderOpen className="h-5 w-5" />
            {folder.name}
            <span className="text-sm text-muted-foreground font-normal">
              ({folder.bookmarks.length})
            </span>
          </CardTitle>
          {folder.description && (
            <p className="text-sm text-muted-foreground">{folder.description}</p>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {folder.bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No bookmarks yet</p>
              ) : (
                folder.bookmarks.map((bookmark) => (
                  <BookmarkItem 
                    key={bookmark._id} 
                    bookmark={bookmark} 
                    onUpdate={onUpdate}
                  />
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <AddBookmarkDialog
        open={showAddBookmark}
        onOpenChange={setShowAddBookmark}
        folderId={folder._id!}
        onSuccess={onUpdate}
      />

      <EditFolderDialog
        open={showEditFolder}
        onOpenChange={setShowEditFolder}
        folder={folder}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default FolderCard; 