"use client";

import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InlineEdit from "@/components/ui/inline-edit";
import {
  ShareFatIcon,
  TrashIcon,
  UsersIcon,
  LinkSimpleIcon,
  LinkBreakIcon,
} from "@phosphor-icons/react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useBoard,
  useUpdateBoard,
  useDeleteBoard,
} from "@/lib/hooks/use-boards";
import BoardTimelineEditor from "@/components/board/BoardTimelineEditor";
import BoardCollaboratorDialog from "@/components/board/BoardCollaboratorDialog";
import { useTimeline } from "@/lib/hooks/use-timeline";
import { useFolders } from "@/lib/hooks/use-bookmarks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BoardDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch board data
  const { data: boardResponse, error } = useBoard(boardId);
  const board = boardResponse?.data?.board;

  // Fetch timeline entries
  const { data: timelineResponse } = useTimeline(boardId, !!boardId);
  const timelineEntries = timelineResponse?.data?.entries ?? [];

  // Fetch folders for linking
  const { data: foldersResponse } = useFolders();
  const folders = foldersResponse?.data?.folders ?? [];

  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();

  const canEdit = board?.userRole === "owner" || board?.userRole === "editor";

  const handleDeleteFolder = () => {
    setDropdownOpen(false);
    setShowDeleteFolderConfirm(true);
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!canEdit || !board?._id) return;

    try {
      await updateBoardMutation.mutateAsync({
        id: board._id,
        data: { name: newTitle },
      });
    } catch (error) {
      console.error("Error updating title:", error);
      throw error;
    }
  };

  const handleUpdateDescription = async (newDescription: string) => {
    if (!canEdit || !board?._id) return;

    try {
      await updateBoardMutation.mutateAsync({
        id: board._id,
        data: { description: newDescription },
      });
    } catch (error) {
      console.error("Error updating description:", error);
      throw error;
    }
  };

  const handleLinkFolder = async (folderId: string | null) => {
    if (!canEdit || !board?._id) return;

    console.log("Linking folder:", folderId, "to board:", board._id);

    try {
      await updateBoardMutation.mutateAsync({
        id: board._id,
        data: { linkedFolderId: folderId },
      });
      console.log("Folder linked successfully");
    } catch (error) {
      console.error("Error linking folder:", error);
    }
  };

  const confirmDeleteBoard = async () => {
    if (!board?._id) return;

    try {
      await deleteBoardMutation.mutateAsync(board._id);
      router.push("/board");
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  if (error) {
    return (
      <div className="mx-auto flex min-h-[90vh] max-w-[86rem] flex-col items-center justify-center px-5 text-center">
        <div className="max-w-md">
          <h2 className="mb-3 text-3xl font-semibold">Error loading board</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error
              ? error.message
              : "This board doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => router.push("/board")} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Boards
          </Button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="mx-auto flex min-h-[90vh] max-w-[86rem] flex-col items-center justify-center px-5 text-center">
        <div className="max-w-md">
          <div className="text-muted-foreground border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 pt-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <InlineEdit
              value={board?.name || ""}
              onSave={handleUpdateTitle}
              placeholder="Enter board name..."
              fontSize="3xl"
              fontWeight="semibold"
              disabled={!canEdit}
              maxLength={100}
              allowEmpty={false}
              className="font-display tracking-tight"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(board.userRole === "owner" || canEdit) && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => {
                    const url = `${window.location.origin}/public/folder/${boardId}`;
                    navigator.clipboard?.writeText(url).catch(() => {
                      void 0;
                    });
                    window.open(url, "_blank");
                  }}
                  className="cursor-pointer rounded-lg"
                >
                  <ShareFatIcon weight="duotone" className="h-4 w-4" />
                  Share Public Link
                </DropdownMenuItem>
                {board.userRole === "owner" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCollaborators(true);
                    }}
                    className="cursor-pointer rounded-lg text-nowrap"
                  >
                    <UsersIcon weight="duotone" className="h-4 w-4" />
                    Manage Collaborators
                  </DropdownMenuItem>
                )}
                {board.userRole === "owner" && (
                  <DropdownMenuItem
                    onClick={handleDeleteFolder}
                    className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
                  >
                    <TrashIcon
                      weight="duotone"
                      className="text-destructive h-4 w-4"
                    />
                    Delete Board
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <InlineEdit
        value={board?.description ?? ""}
        onSave={handleUpdateDescription}
        placeholder="Add a description..."
        fontSize="base"
        fontWeight="normal"
        disabled={!canEdit}
        multiline
        maxLength={500}
        allowEmpty={true}
        className="text-muted-foreground"
      />

      {/* Linked Folder Section */}
      <div className="mt-4">
        {canEdit ? (
          <div className="flex items-center gap-3">
            <LinkSimpleIcon
              weight="duotone"
              className="text-muted-foreground h-5 w-5"
            />
            <div className="flex flex-1 items-center gap-2">
              {board?.linkedFolder ? (
                // Show linked folder with option to change
                <div className="bg-muted/30 flex h-9 w-full flex-1 items-center justify-between gap-2 rounded-lg border pl-2 pr-1">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: board.linkedFolder.color }}
                  />
                  <span className="flex-1 text-sm font-medium">
                    {board.linkedFolder.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLinkFolder(null)}
                    className="text-destructive rounded-sm hover:text-destructive h-7 gap-1 px-2 text-xs"
                  >
                    <LinkBreakIcon weight="duotone" className="size-3" />
                    Unlink
                  </Button>
                </div>
              ) : (
                // Show selector if no folder linked
                <Select
                  value={board?.linkedFolderId ?? "none"}
                  onValueChange={(value) =>
                    handleLinkFolder(value === "none" ? null : value)
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Link to a bookmark folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder._id} value={folder._id!}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-sm"
                            style={{
                              backgroundColor: folder.color ?? "#3b82f6",
                            }}
                          />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {board?.linkedFolder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/bookmarks/${board.linkedFolder?.id}`)
                  }
                  className="gap-2"
                >
                  <LinkSimpleIcon weight="duotone" className="h-4 w-4" />
                  Open Folder
                </Button>
              )}
            </div>
          </div>
        ) : board?.linkedFolder ? (
          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
            <LinkSimpleIcon
              weight="duotone"
              className="text-muted-foreground h-5 w-5"
            />
            <div className="flex flex-1 items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: board.linkedFolder.color }}
              />
              <span className="text-sm font-medium">
                {board.linkedFolder.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/bookmarks/${board.linkedFolder?.id}`)
              }
              className="gap-2"
            >
              <LinkSimpleIcon weight="duotone" className="h-4 w-4" />
              Open Folder
            </Button>
          </div>
        ) : null}
      </div>

      {/* Collaborative Timeline Editor */}
      <div className="mt-8">
        <BoardTimelineEditor
          boardId={boardId}
          timelineEntries={timelineEntries}
          disabled={!canEdit}
          userRole={board?.userRole}
        />
      </div>

      {/* Dialogs */}
      <BoardCollaboratorDialog
        open={showCollaborators}
        onOpenChange={setShowCollaborators}
        boardId={boardId}
        boardName={board?.name || ""}
      />

      {/* Board Deletion Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteFolderConfirm}
        onOpenChange={setShowDeleteFolderConfirm}
        title="Delete Board"
        description={`Are you sure you want to delete "${board.name}" and all its cards? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteBoard}
        isLoading={false}
      />
    </div>
  );
};

export default BoardDetailPage;
