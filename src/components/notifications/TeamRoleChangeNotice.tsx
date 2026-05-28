"use client";

import { TeamAvatar } from "@/components/team/TeamAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamRoleChangeNotification } from "@/lib/hooks/use-inbox";
import { ShieldCheck, XIcon } from "lucide-react";
import { useState } from "react";

interface TeamRoleChangeNoticeProps {
  notification: TeamRoleChangeNotification;
  onDismiss: (memberId: string) => void | Promise<void>;
}

export default function TeamRoleChangeNotice({
  notification,
  onDismiss,
}: TeamRoleChangeNoticeProps) {
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
    <Card className="relative overflow-hidden border-violet-400/30 p-0 shadow-xs ring-2 ring-violet-400/10">
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
                <ShieldCheck className="h-5 w-5 text-violet-500" />
                <h4 className="font-medium">Role Updated</h4>
                <Badge variant="info">Updated</Badge>
              </div>
              <div className="text-muted-foreground mb-2 text-sm">
                Your role in{" "}
                <span className="text-foreground font-medium">
                  {notification.teamName}
                </span>{" "}
                was changed
                {notification.previousRole ? (
                  <>
                    {" "}
                    from{" "}
                    <Badge variant="default" className="text-xs">
                      {notification.previousRole}
                    </Badge>
                  </>
                ) : null}{" "}
                to{" "}
                <Badge
                  variant={
                    notification.newRole === "editor" ? "info" : "default"
                  }
                  className="text-xs"
                >
                  {notification.newRole}
                </Badge>
                {notification.changedByName ? (
                  <>
                    {" "}
                    by{" "}
                    <span className="font-medium">
                      {notification.changedByName}
                    </span>
                  </>
                ) : null}
                .
              </div>
              <p className="text-muted-foreground text-xs">
                Updated {new Date(notification.changedAt).toLocaleDateString()}
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
