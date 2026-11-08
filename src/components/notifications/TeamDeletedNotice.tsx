"use client";

import { TeamAvatar } from "@/components/team/TeamAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamDeletedNotification } from "@/lib/hooks/use-inbox";
import { Trash2, XIcon } from "lucide-react";
import { useState } from "react";

interface TeamDeletedNoticeProps {
  notification: TeamDeletedNotification;
  onDismiss: (noticeId: string) => void | Promise<void>;
}

export async function dismissTeamDeletedNotice(noticeId: string) {
  const res = await fetch(`/api/teams/invitations/team-deleted/${noticeId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to dismiss notification");
}

export default function TeamDeletedNotice({
  notification,
  onDismiss,
}: TeamDeletedNoticeProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDismiss = async () => {
    setIsProcessing(true);
    try {
      await onDismiss(notification.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-rose-400/30 p-0 shadow-xs ring-2 ring-rose-400/10">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <TeamAvatar
              name={notification.teamName}
              logoUrl={notification.teamLogoUrl}
              size={36}
            />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <h4 className="font-medium">Team Deleted</h4>
                <Badge variant="default">Removed</Badge>
              </div>
              <div className="text-muted-foreground mb-2 text-sm">
                <span className="text-foreground font-medium">
                  {notification.teamName}
                </span>{" "}
                was deleted
                {notification.deletedByName ? (
                  <>
                    {" "}
                    by{" "}
                    <span className="font-medium">
                      {notification.deletedByName}
                    </span>
                  </>
                ) : null}
                , so you no longer have access to its boards and bookmarks.
              </div>
              <p className="text-muted-foreground text-xs">
                Deleted {new Date(notification.deletedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="ml-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleDismiss()}
              disabled={isProcessing}
              className="h-8"
            >
              <XIcon className="h-4 w-4" />
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
