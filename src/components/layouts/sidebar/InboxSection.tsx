"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import CollaborationInvite from "@/components/notifications/CollaborationInvite";
import type { FolderCollaboration, Folder } from "@/types";
import { EnvelopeIcon } from "@phosphor-icons/react";

interface InboxSectionProps {
  invitations: (FolderCollaboration & { folder?: Folder })[];
  loading: boolean;
  onAccept: (collaborationId: string) => void;
  onDecline: (collaborationId: string) => void;
  className?: string;
}

export default function InboxSection({ 
  invitations, 
  loading, 
  onAccept, 
  onDecline, 
  className = "" 
}: InboxSectionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Inbox</span>
        </div>
        {invitations.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {invitations.length}
          </Badge>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="max-h-96">
        <div className="space-y-3 px-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : invitations.length > 0 ? (
            invitations.map((invitation) => (
              <CollaborationInvite
                key={invitation._id}
                collaboration={invitation}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <EnvelopeIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending invitations</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
