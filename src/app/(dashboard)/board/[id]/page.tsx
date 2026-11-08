"use client";

import BoardCollaboratorDialog from "@/components/board/BoardCollaboratorDialog";
import BoardSidePanel from "@/components/board/BoardSidePanel";
import BoardTimelineEditor from "@/components/board/BoardTimelineEditor";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InlineEdit from "@/components/ui/inline-edit";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBoard,
  useDeleteBoard,
  useUpdateBoard,
} from "@/lib/hooks/use-boards";
import { useFolders } from "@/lib/hooks/use-bookmarks";
import { useTimeline } from "@/lib/hooks/use-timeline";
import {
  TrashBinTrash,
  UserPlus,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { useTeam } from "@/lib/contexts/team-context";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ArrowLeft, MoreVertical, PanelRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PANEL_KEY = "stashr.boardDetailsPanel";

const BoardDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Details panel: a column on desktop (remembered), a drawer below lg.
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(PANEL_KEY) === "closed") setPanelOpen(false);
    } catch {}
  }, []);
  const toggleDetails = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setSheetOpen(true);
      return;
    }
    setPanelOpen((open) => {
      try {
        localStorage.setItem(PANEL_KEY, open ? "closed" : "open");
      } catch {}
      return !open;
    });
  };

  const { currentTeam } = useTeam();
  const originalTeamIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentTeam?.id) return;
    if (originalTeamIdRef.current === null) {
      originalTeamIdRef.current = currentTeam.id;
      return;
    }
    if (currentTeam.id !== originalTeamIdRef.current) {
      toast.info("Switched team - returning to boards");
      router.replace("/board");
    }
  }, [currentTeam?.id, router]);

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
      <div className="relative min-h-screen space-y-4 pt-2">
        <div className="absolute top-[33%] z-10 h-60 w-full bg-linear-to-b from-transparent to-[#fafafa] sm:top-[26%] dark:to-[#0f0f11]" />
        {/* Header Skeleton */}
        <div className="m-0 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Timeline Skeleton */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-32 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const detailsPanel = (
    <BoardSidePanel
      entries={timelineEntries}
      folders={folders}
      linkedFolder={board.linkedFolder}
      canEdit={canEdit}
      onLinkFolder={(id) => void handleLinkFolder(id)}
    />
  );

  return (
    <div className="min-h-screen space-y-4">
      {/* Header */}
      <div className="m-0 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex w-full items-center justify-between">
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDetails}
              aria-label={panelOpen ? "Hide details" : "Show details"}
              title={panelOpen ? "Hide details" : "Show details"}
              className={cn("px-2", panelOpen && "lg:bg-muted")}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
            {(board.userRole === "owner" || canEdit) && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  {board.userRole === "owner" && (
                    <DropdownMenuItem
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowCollaborators(true);
                      }}
                      className="cursor-pointer rounded-lg text-nowrap"
                    >
                      <UserPlus className="h-4 w-4" />
                      Manage Collaborators
                    </DropdownMenuItem>
                  )}
                  {board.userRole === "owner" && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDeleteFolder}
                    >
                      <TrashBinTrash className="h-4 w-4" />
                      Delete Board
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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

      {/* Timeline, with board properties (folder, links, images) on the right */}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <BoardTimelineEditor
            boardId={boardId}
            timelineEntries={timelineEntries}
            disabled={!canEdit}
            userRole={board?.userRole}
          />
        </div>
        {panelOpen && (
          <div className="hidden shrink-0 lg:block lg:w-72 lg:border-l lg:pl-6">
            {detailsPanel}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title="Details">
        {detailsPanel}
      </Sheet>

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
        isLoading={deleteBoardMutation.isPending}
      />
    </div>
  );
};

export default BoardDetailPage;
