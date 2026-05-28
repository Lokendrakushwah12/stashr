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

  const handle = async (action: "accept" | "decline") => {
    setIsProcessing(true);
    try {
      await onRespond(invitation.id, action);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-[0_-1px_--theme(--color-border/70%)] relative overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-1 bg-blue-400/50" />
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
                <Users className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Team Invitation</h4>
                <Badge variant="warning">Pending</Badge>
              </div>
              <div className="text-muted-foreground mb-2 text-sm">
                You&apos;ve been invited to join the team{" "}
                <span className="text-foreground font-medium">
                  {invitation.teamName}
                </span>{" "}
                as a{" "}
                <Badge
                  variant={invitation.role === "editor" ? "info" : "default"}
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
              </div>
              <p className="text-muted-foreground text-xs">
                Invited {new Date(invitation.invitedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
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
        </div>
      </CardContent>
    </Card>
  );
}
