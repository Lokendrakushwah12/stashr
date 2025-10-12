"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowCircleUpIcon,
  DiamondIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRelativeTime, formatExactDate } from "@/lib/utils";
import { useCreateTimelineEntry, useUpdateTimelineEntry } from "@/lib/hooks/use-timeline";
import type { BoardTimelineEntry } from "@/types";
import InlineEdit from "@/components/ui/inline-edit";

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
  const createTimelineEntry = useCreateTimelineEntry(boardId);
  const updateTimelineEntry = useUpdateTimelineEntry(boardId);

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
        action: 'created',
      });
      setNewEntryContent("");
      setManualShowEntry(false);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleCancelNewEntry = () => {
    setNewEntryContent("");
    setManualShowEntry(false);
  };

  const handleUpdateEntry = async (entryId: string, newContent: string) => {
    if (!newContent.trim()) return;
    
    try {
      await updateTimelineEntry.mutateAsync({ entryId, content: newContent.trim() });
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
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
        return "bg-purple-500";
      case "editor":
        return "bg-blue-500";
      case "viewer":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
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
              <Avatar className="border-background size-8 rounded-md border-2">
                <AvatarImage src={entry.userImage ?? ""} alt={entry.userName} />
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
                      <span className="text-muted-foreground text-xs cursor-help">
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
              <div className="border-border bg-card overflow-hidden rounded-lg border">
                <div className="p-4">
                  {entry.userId === session?.user?.id && canEdit ? (
                    <InlineEdit
                      value={entry.content}
                      onSave={(newContent) => handleUpdateEntry(entry._id, newContent)}
                      placeholder="Add content..."
                      fontSize="sm"
                      fontWeight="normal"
                      disabled={disabled}
                      multiline
                      maxLength={5000}
                      allowEmpty={false}
                      className="text-foreground prose prose-sm max-w-none"
                    />
                  ) : (
                    <div className="text-foreground prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                      {entry.content}
                    </div>
                  )}
                </div>
              </div>
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

              <div className="border-border bg-card rounded-lg border">
                <div className="p-4">
                  <textarea
                    value={newEntryContent}
                    onChange={(e) => setNewEntryContent(e.target.value)}
                    placeholder="Add a comment or update..."
                    disabled={disabled}
                    className="w-full min-h-[100px] text-sm bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <div className="border-border bg-muted/30 flex items-center justify-end gap-2 border-t p-1">
                  <Button
                    size="sm"
                    onClick={() => handleSaveNewEntry(newEntryContent)}
                    disabled={!newEntryContent.trim() || createTimelineEntry.isPending}
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
    </div>
  );
}
