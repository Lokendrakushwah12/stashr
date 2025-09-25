"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FolderCollaboration, Folder } from "@/types";
import { CheckIcon, XIcon, FolderOpenIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CollaborationInviteProps {
  collaboration: FolderCollaboration & { folder?: Folder };
  onAccept: (collaborationId: string) => void;
  onDecline: (collaborationId: string) => void;
}

export default function CollaborationInvite({
  collaboration,
  onAccept,
  onDecline,
}: CollaborationInviteProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(collaboration._id!);
      toast.success('Invitation accepted! You can now access this folder.');
    } catch (error) {
      toast.error('Failed to accept invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await onDecline(collaboration._id!);
      toast.success('Invitation declined');
    } catch (error) {
      toast.error('Failed to decline invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToFolder = () => {
    if (collaboration.folderId) {
      router.push(`/folder/${collaboration.folderId}`);
    }
  };

  const isAccepted = collaboration.status === 'accepted';
  const isPending = collaboration.status === 'pending';

  return (
    <Card className={`border-l-4 ${isAccepted ? 'border-l-green-500' : 'border-l-blue-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">
                {isAccepted ? 'Collaboration Access' : 'Collaboration Invitation'}
              </h4>
              <Badge variant={isAccepted ? 'success' : 'warning'}>
                {isAccepted ? 'Accepted' : 'Pending'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {isAccepted ? (
                <>
                  You have access to collaborate on{" "}
                  <span className="font-medium">
                    {collaboration.folder?.name || "this folder"}
                  </span>
                  {" "}as a{" "}
                  <Badge variant={collaboration.role === 'editor' ? 'info' : 'gray'} className="text-xs">
                    {collaboration.role}
                  </Badge>
                </>
              ) : (
                <>
                  You've been invited to collaborate on{" "}
                  <span className="font-medium">
                    {collaboration.folder?.name || "a folder"}
                  </span>
                  {" "}as a{" "}
                  <Badge variant={collaboration.role === 'editor' ? 'info' : 'gray'} className="text-xs">
                    {collaboration.role}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Invited by {collaboration.invitedByUserName} • {new Date(collaboration.createdAt!).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            {isAccepted ? (
              <Button
                size="sm"
                onClick={handleGoToFolder}
                className="h-8"
              >
                <FolderOpenIcon weight="duotone" className="h-4 w-4 mr-1" />
                Go to Folder
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="h-8"
                >
                  <CheckIcon weight="duotone" className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="h-8"
                >
                  <XIcon weight="duotone" className="h-4 w-4 mr-1" />
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
