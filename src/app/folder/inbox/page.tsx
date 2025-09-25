"use client";

import CollaborationInvite from "@/components/notifications/CollaborationInvite";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FolderCollaboration, Folder } from "@/types";
import { ArrowsClockwiseIcon, EnvelopeIcon } from "@phosphor-icons/react";
import { Loader, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingInvitations, setPendingInvitations] = useState<(FolderCollaboration & { folder?: Folder })[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const fetchPendingInvitations = async () => {
    if (!session?.user?.id) return;
    
    setLoadingInvitations(true);
    try {
      const response = await fetch('/api/collaborations/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      const data = await response.json() as { invitations: (FolderCollaboration & { folder?: Folder })[] };
      setPendingInvitations(data.invitations ?? []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleAcceptInvitation = async (collaborationId: string) => {
    try {
      const response = await fetch(`/api/collaborations/${collaborationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      void fetchPendingInvitations();
      toast.success('Invitation accepted!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (collaborationId: string) => {
    try {
      const response = await fetch(`/api/collaborations/${collaborationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      void fetchPendingInvitations();
      toast.success('Invitation declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      void fetchPendingInvitations();
    }
  }, [session?.user?.id]);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-2">
            Manage your collaboration invitations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchPendingInvitations}
            variant="outline"
            size="sm"
            disabled={loadingInvitations}
          >
            <ArrowsClockwiseIcon 
              weight="duotone" 
              className={`h-4 w-4 ${loadingInvitations ? 'animate-spin' : ''}`} 
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border flex relative rounded-2xl bg-secondary/20 overflow-hidden">
          <div className="flex flex-col w-full justify-center items-start p-4">
            {loadingInvitations ? (
              <Skeleton className="h-9 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-mono font-semibold">{pendingInvitations.length}</div>
            )}
            <div className="text-sm text-muted-foreground">Pending Invitations</div>
          </div>
          <div className="flex justify-center items-center px-9 h-full bg-muted/30 bg-lines-diag">
            <EnvelopeIcon weight="duotone" strokeWidth={1} className="size-10 text-muted-foreground" />
          </div>
        </div>
        <div className="border flex relative rounded-2xl bg-secondary/20 overflow-hidden">
          <div className="flex flex-col w-full justify-center items-start p-4">
            {loadingInvitations ? (
              <Skeleton className="h-9 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-mono font-semibold">
                {pendingInvitations.filter(inv => inv.status === 'accepted').length}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Accepted Invitations</div>
          </div>
          <div className="flex justify-center items-center px-9 h-full bg-muted/30 bg-lines-diag">
            <EnvelopeIcon weight="duotone" strokeWidth={1} className="size-10 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Invitations */}
      {loadingInvitations ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading invitations...</p>
        </div>
      ) : pendingInvitations.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Collaboration Invitations</h2>
            <div className="px-2 py-1 bg-warning/20 text-warning-600 dark:text-warning-400 rounded-full text-xs font-medium">
              {pendingInvitations.length}
            </div>
          </div>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <CollaborationInvite
                key={invitation._id}
                collaboration={invitation}
                onAccept={handleAcceptInvitation}
                onDecline={handleDeclineInvitation}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <EnvelopeIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No invitations</h3>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have any collaboration invitations at the moment.
          </p>
          <Button onClick={fetchPendingInvitations} variant="outline">
            <ArrowsClockwiseIcon weight="duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
