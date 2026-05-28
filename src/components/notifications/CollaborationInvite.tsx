"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Board,
  BoardCollaboration,
  Folder,
  FolderCollaboration,
} from "@/types";
import {
  FolderOpen,
  Stars,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Bookmark, CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CollaborationInviteProps {
  collaboration:
    | (FolderCollaboration & { folder?: Folder })
    | (BoardCollaboration & { board?: Board });
  onAccept: (collaborationId: string, type: "folder" | "board") => void;
  onDecline: (collaborationId: string, type: "folder" | "board") => void;
}

export default function CollaborationInvite({
  collaboration,
  onAccept,
  onDecline,
}: CollaborationInviteProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const isBoard = "board" in collaboration && collaboration.board;
  const type: "folder" | "board" = isBoard ? "board" : "folder";

  const resourceName = isBoard
    ? (collaboration as BoardCollaboration & { board?: Board }).board?.name
    : (collaboration as FolderCollaboration & { folder?: Folder }).folder?.name;

  const resourceId = isBoard
    ? (collaboration as BoardCollaboration).boardId
    : (collaboration as FolderCollaboration).folderId;

  const handleAccept = () => {
    setIsProcessing(true);
    try {
      onAccept(collaboration._id!, type);
      toast.success(`Invitation accepted! You can now access this ${type}.`);
    } catch {
      toast.error("Failed to accept invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    setIsProcessing(true);
    try {
      onDecline(collaboration._id!, type);
      toast.success("Invitation declined");
    } catch {
      toast.error("Failed to decline invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToResource = () => {
    if (resourceId) {
      const path = isBoard
        ? `/board/${resourceId}`
        : `/bookmarks/${resourceId}`;
      router.push(path);
    }
  };

  const isAccepted = collaboration.status === "accepted";

  const accentClass = isAccepted
    ? "ring-emerald-400/10 border-emerald-400/30"
    : "ring-blue-400/10 border-blue-400/30";
  const iconClass = isAccepted
    ? "text-emerald-500"
    : isBoard
      ? "text-purple-500"
      : "text-blue-500";

  return (
    <Card
      className={`relative overflow-hidden p-0 shadow-xs ring-2 ${accentClass}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {isBoard ? (
                <Stars className={`h-5 w-5 ${iconClass}`} />
              ) : (
                <Bookmark className={`h-5 w-5 ${iconClass}`} />
              )}
              <h4 className="font-medium">
                {isAccepted
                  ? "Collaboration Access"
                  : "Collaboration Invitation"}
              </h4>
              <Badge variant={isAccepted ? "success" : "warning"}>
                {isAccepted ? "Accepted" : "Pending"}
              </Badge>
            </div>
            <div className="text-muted-foreground mb-2 text-sm">
              {isAccepted ? (
                <>
                  You have access to collaborate on the {type}{" "}
                  <span className="text-foreground font-medium">
                    {resourceName ?? `this ${type}`}
                  </span>{" "}
                  as a{" "}
                  <Badge
                    variant={
                      collaboration.role === "editor" ? "info" : "default"
                    }
                    className="text-xs"
                  >
                    {collaboration.role}
                  </Badge>
                </>
              ) : (
                <>
                  You&apos;ve been invited to collaborate on the {type}{" "}
                  <span className="text-foreground font-medium">
                    {resourceName ?? `a ${type}`}
                  </span>{" "}
                  as a{" "}
                  <Badge
                    variant={
                      collaboration.role === "editor" ? "info" : "default"
                    }
                    className="text-xs"
                  >
                    {collaboration.role}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Invited {new Date(collaboration.createdAt!).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            {isAccepted ? (
              <Button size="sm" onClick={handleGoToResource} className="h-8">
                {isBoard ? (
                  <Stars className="h-4 w-4" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
                Go to {isBoard ? "Board" : "Folder"}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="h-8"
                >
                  <CheckIcon className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="h-8"
                >
                  <XIcon className="h-4 w-4" />
                  Decline
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
