"use client";

import { TeamAvatar } from "@/components/team/TeamAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamDeclineNotification } from "@/lib/hooks/use-inbox";
import { Users, XIcon } from "lucide-react";
import { useState } from "react";

interface TeamDeclineNoticeProps {
  notification: TeamDeclineNotification;
  onDismiss: (memberId: string) => void | Promise<void>;
}

export default function TeamDeclineNotice({
  notification,
  onDismiss,
}: TeamDeclineNoticeProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDismiss = async () => {
    setIsProcessing(true);
    try {
      await onDismiss(notification.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayName = notification.invitedName ?? notification.invitedEmail;

  return (
    <Card className="shadow-[0_-1px_--theme(--color-border/70%)] relative overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-1 bg-red-400/50" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <TeamAvatar
              name={notification.teamName}
              logoUrl={notification.teamLogoUrl}
              size={36}
            />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Users className="text-muted-foreground h-5 w-5" />
                <h4 className="font-medium">Invitation Declined</h4>
                <Badge variant="default">Declined</Badge>
              </div>
              <div className="text-muted-foreground mb-2 text-sm">
                <span className="text-foreground font-medium">
                  {displayName}
                </span>{" "}
                declined your invitation to{" "}
                <span className="text-foreground font-medium">
                  {notification.teamName}
                </span>{" "}
                as a{" "}
                <Badge
                  variant={notification.role === "editor" ? "info" : "default"}
                  className="text-xs"
                >
                  {notification.role}
                </Badge>
                .
              </div>
              {notification.respondedAt && (
                <p className="text-muted-foreground text-xs">
                  Declined{" "}
                  {new Date(notification.respondedAt).toLocaleDateString()}
                </p>
              )}
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
