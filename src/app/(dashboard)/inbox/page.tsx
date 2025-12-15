"use client";

import CollaborationInvite from "@/components/notifications/CollaborationInvite";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInbox } from "@/lib/hooks/use-inbox";
import {
  InboxIn,
  InboxLine,
  Refresh,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, isLoading, isFetching, refetch } = useInbox(session?.user?.id);

  const folderInvitations = data?.folderInvitations ?? [];
  const boardInvitations = data?.boardInvitations ?? [];
  const pendingInvitations = [...folderInvitations, ...boardInvitations];
  const loadingInvitations = isLoading || isFetching;

  const handleAcceptInvitation = async (
    collaborationId: string,
    type: "folder" | "board",
  ) => {
    try {
      const endpoint =
        type === "board"
          ? `/api/boards/collaborations/${collaborationId}`
          : `/api/collaborations/${collaborationId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      void refetch();
      toast.success("Invitation accepted!");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (
    collaborationId: string,
    type: "folder" | "board",
  ) => {
    try {
      const endpoint =
        type === "board"
          ? `/api/boards/collaborations/${collaborationId}`
          : `/api/collaborations/${collaborationId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to decline invitation");
      }

      void refetch();
      toast.success("Invitation declined");
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error("Failed to decline invitation");
    }
  };

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">
            Manage your collaboration invitations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              void refetch();
            }}
            variant="outline"
            size="sm"
            disabled={loadingInvitations}
          >
            <Refresh
              className={`h-4 w-4 ${loadingInvitations ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border">
          <div className="flex w-full flex-col items-start justify-center p-4">
            {loadingInvitations ? (
              <Skeleton className="mb-1 h-9 w-16" />
            ) : (
              <div className="font-mono text-3xl font-semibold">
                {
                  pendingInvitations.filter((inv) => inv.status === "pending")
                    .length
                }
              </div>
            )}
            <div className="text-muted-foreground text-sm">
              Pending Invitations
            </div>
          </div>
          <div className="bg-muted/30 bg-lines-diag flex h-full items-center justify-center px-9">
            <InboxIn
              strokeWidth={1}
              className="text-muted-foreground size-10"
            />
          </div>
        </div>
        <div className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border">
          <div className="flex w-full flex-col items-start justify-center p-4">
            {loadingInvitations ? (
              <Skeleton className="mb-1 h-9 w-16" />
            ) : (
              <div className="font-mono text-3xl font-semibold">
                {
                  pendingInvitations.filter((inv) => inv.status === "accepted")
                    .length
                }
              </div>
            )}
            <div className="text-muted-foreground text-sm">
              Accepted Invitations
            </div>
          </div>
          <div className="bg-muted/30 bg-lines-diag flex h-full items-center justify-center px-9">
            <InboxLine
              strokeWidth={1}
              className="text-muted-foreground size-10"
            />
          </div>
        </div>
      </div>

      {/* Invitations */}
      {loadingInvitations ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <div className="relative space-y-3">
            <div className="absolute inset-0 z-10 -mb-1 bg-linear-to-b from-transparent to-[#fafafa] dark:to-[#0f0f11]" />
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : pendingInvitations.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium tracking-tight">
              Collaboration Invitations
            </h2>
            <div className="bg-warning/20 text-warning-600 dark:text-warning-400 rounded-full px-2 py-1 text-xs font-medium">
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
          <InboxLine className="text-muted-foreground mb-4 h-16 w-16 opacity-50" />
          <h3 className="mb-2 text-lg font-medium">No invitations</h3>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have any collaboration invitations at the moment.
          </p>
          <Button
            onClick={() => {
              void refetch();
            }}
            variant="outline"
          >
            <Refresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
