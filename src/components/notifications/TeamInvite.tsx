"use client";

import { TeamAvatar } from "@/components/team/TeamAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamInvitation } from "@/lib/hooks/use-inbox";
import { CheckIcon, Users, XIcon } from "lucide-react";
import { useState } from "react";

interface TeamInviteProps {
  invitation: TeamInvitation;
  onRespond: (
    memberId: string,
    action: "accept" | "decline",
  ) => void | Promise<void>;
}

export default function TeamInvite({ invitation, onRespond }: TeamInviteProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isDeclined = invitation.status === "declined";
  const isAccepted = invitation.status === "accepted";
  const isPending = invitation.status === "pending";

  const handle = async (action: "accept" | "decline") => {
    setIsProcessing(true);
    try {
      await onRespond(invitation.id, action);
    } finally {
      setIsProcessing(false);
    }
  };

  const accentClass = isAccepted
    ? "bg-green-400/50"
    : isDeclined
      ? "bg-muted-foreground/40"
      : "bg-blue-400/50";
  const iconClass = isAccepted
    ? "text-green-500"
    : isDeclined
      ? "text-muted-foreground"
      : "text-blue-500";
  const statusBadgeVariant = isAccepted
    ? "success"
    : isDeclined
      ? "default"
      : "warning";
  const statusLabel = isAccepted
    ? "Accepted"
    : isDeclined
      ? "Declined"
      : "Pending";

  return (
    <Card className="shadow-[0_-1px_--theme(--color-border/70%)] relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-full w-1 ${accentClass}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <TeamAvatar
              name={invitation.teamName}
              logoUrl={invitation.teamLogoUrl}
              size={36}
            />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Users className={`h-5 w-5 ${iconClass}`} />
                <h4 className="font-medium">Team Invitation</h4>
                <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
              </div>
              <div className="text-muted-foreground mb-2 text-sm">
                {isAccepted ? (
                  <>
                    You accepted the invitation to join{" "}
                    <span className="text-foreground font-medium">
                      {invitation.teamName}
                    </span>{" "}
                    as a{" "}
                    <Badge
                      variant={
                        invitation.role === "editor" ? "info" : "default"
                      }
                      className="text-xs"
                    >
                      {invitation.role}
                    </Badge>
                    {invitation.invitedByName ? (
                      <>
                        {" "}
                        from{" "}
                        <span className="font-medium">
                          {invitation.invitedByName}
                        </span>
                      </>
                    ) : null}
                    .
                  </>
                ) : isDeclined ? (
                  <>
                    You declined the invitation to join{" "}
                    <span className="text-foreground font-medium">
                      {invitation.teamName}
                    </span>{" "}
                    as a{" "}
                    <Badge
                      variant={
                        invitation.role === "editor" ? "info" : "default"
                      }
                      className="text-xs"
                    >
                      {invitation.role}
                    </Badge>
                    {invitation.invitedByName ? (
                      <>
                        {" "}
                        from{" "}
                        <span className="font-medium">
                          {invitation.invitedByName}
                        </span>
                      </>
                    ) : null}
                    .
                  </>
                ) : (
                  <>
                    You&apos;ve been invited to join the team{" "}
                    <span className="text-foreground font-medium">
                      {invitation.teamName}
                    </span>{" "}
                    as a{" "}
                    <Badge
                      variant={
                        invitation.role === "editor" ? "info" : "default"
                      }
                      className="text-xs"
                    >
                      {invitation.role}
                    </Badge>
                    {invitation.invitedByName ? (
                      <>
                        {" "}
                        by{" "}
                        <span className="font-medium">
                          {invitation.invitedByName}
                        </span>
                      </>
                    ) : null}
                  </>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {isAccepted && invitation.respondedAt
                  ? `Joined ${new Date(invitation.respondedAt).toLocaleDateString()}`
                  : isDeclined && invitation.respondedAt
                    ? `Declined ${new Date(invitation.respondedAt).toLocaleDateString()}`
                    : `Invited ${new Date(invitation.invitedAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          {isPending && (
            <div className="ml-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => void handle("accept")}
                disabled={isProcessing}
                className="h-8"
              >
                <CheckIcon className="h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handle("decline")}
                disabled={isProcessing}
                className="h-8"
              >
                <XIcon className="h-4 w-4" />
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
