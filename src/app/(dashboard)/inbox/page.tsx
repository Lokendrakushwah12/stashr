"use client";

import CollaborationInvite from "@/components/notifications/CollaborationInvite";
import TeamDeclineNotice from "@/components/notifications/TeamDeclineNotice";
import TeamDeletedNotice, {
  dismissTeamDeletedNotice,
} from "@/components/notifications/TeamDeletedNotice";
import TeamInvite from "@/components/notifications/TeamInvite";
import TeamRoleChangeNotice from "@/components/notifications/TeamRoleChangeNotice";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeam } from "@/lib/contexts/team-context";
import { useInbox, type TeamInvitation } from "@/lib/hooks/use-inbox";
import {
  InboxIn,
  InboxLine,
  Refresh,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Skeleton } from "skullet/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Shapes the first skeleton, drawn from the real invite card.
const SAMPLE_INVITES: TeamInvitation[] = [0, 1, 2].map((i) => ({
  id: `sample-${i}`,
  teamId: `sample-${i}`,
  teamName: "Design team",
  role: "editor",
  status: "pending",
  invitedByName: "Maya Chen",
  invitedAt: new Date().toISOString(),
}));

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, isLoading, isFetching, refetch } = useInbox(session?.user?.id);
  const { refresh: refreshTeams } = useTeam();

  const folderInvitations = data?.folderInvitations ?? [];
  const boardInvitations = data?.boardInvitations ?? [];
  const teamInvitations = data?.teamInvitations ?? [];
  const teamDeclineNotifications = data?.teamDeclineNotifications ?? [];
  const teamRoleChangeNotifications = data?.teamRoleChangeNotifications ?? [];
  const teamDeletedNotifications = data?.teamDeletedNotifications ?? [];
  const pendingTeamInvitations = teamInvitations.filter(
    (inv) => inv.status === "pending",
  );
  const historyTeamInvitations = teamInvitations
    .filter((inv) => inv.status === "declined" || inv.status === "accepted")
    .sort((a, b) => {
      const aDate = a.respondedAt ? new Date(a.respondedAt).getTime() : 0;
      const bDate = b.respondedAt ? new Date(b.respondedAt).getTime() : 0;
      return bDate - aDate;
    });
  const acceptedTeamInvitations = teamInvitations.filter(
    (inv) => inv.status === "accepted",
  );
  const pendingInvitations = [...folderInvitations, ...boardInvitations];
  const loadingInvitations = isLoading || isFetching;

  const handleDismissDecline = async (memberId: string) => {
    try {
      const response = await fetch(`/api/teams/invitations/${memberId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to dismiss notification");
      }
      void refetch();
      toast.success("Notification dismissed");
    } catch (error) {
      console.error("Error dismissing decline notification:", error);
      toast.error("Failed to dismiss");
    }
  };

  const handleDismissRoleChange = async (memberId: string) => {
    try {
      const response = await fetch(
        `/api/teams/invitations/${memberId}/role-change`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error("Failed to dismiss notification");
      }
      void refetch();
      toast.success("Notification dismissed");
    } catch (error) {
      console.error("Error dismissing role change notification:", error);
      toast.error("Failed to dismiss");
    }
  };

  const handleDismissTeamDeleted = async (noticeId: string) => {
    try {
      await dismissTeamDeletedNotice(noticeId);
      void refetch();
      toast.success("Notification dismissed");
    } catch (error) {
      console.error("Error dismissing team deleted notification:", error);
      toast.error("Failed to dismiss");
    }
  };

  const handleTeamInvitation = async (
    memberId: string,
    action: "accept" | "decline",
  ) => {
    try {
      const response = await fetch(`/api/teams/invitations/${memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        throw new Error("Failed to respond to invitation");
      }
      void refetch();
      if (action === "accept") {
        await refreshTeams();
        toast.success("You joined the team!");
      } else {
        toast.success("Invitation declined");
      }
    } catch (error) {
      console.error("Error responding to team invitation:", error);
      toast.error("Failed to respond to invitation");
    }
  };

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
            <Skeleton loading={isLoading} label="Loading inbox count">
              <div className="font-mono text-3xl font-semibold">
                {pendingInvitations.filter((inv) => inv.status === "pending")
                  .length +
                  pendingTeamInvitations.length +
                  teamDeclineNotifications.length +
                  teamRoleChangeNotifications.length +
                  teamDeletedNotifications.length}
              </div>
            </Skeleton>
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
            <Skeleton loading={isLoading} label="Loading inbox count">
              <div className="font-mono text-3xl font-semibold">
                {pendingInvitations.filter((inv) => inv.status === "accepted")
                  .length + acceptedTeamInvitations.length}
              </div>
            </Skeleton>
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

      {/* Invitations: measured from real cards while loading */}
      <Skeleton loading={isLoading} label="Loading inbox">
        {isLoading ? (
          <div className="space-y-3">
            {SAMPLE_INVITES.map((invitation) => (
              <TeamInvite
                key={invitation.id}
                invitation={invitation}
                onRespond={() => undefined}
              />
            ))}
          </div>
        ) : pendingInvitations.length +
            teamInvitations.length +
            teamDeclineNotifications.length +
            teamRoleChangeNotifications.length +
            teamDeletedNotifications.length >
          0 ? (
          <div className="space-y-6">
            {teamDeletedNotifications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    Deleted Teams
                  </h2>
                  <div className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs font-medium">
                    {teamDeletedNotifications.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {teamDeletedNotifications.map((notification) => (
                    <TeamDeletedNotice
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismissTeamDeleted}
                    />
                  ))}
                </div>
              </div>
            )}
            {teamRoleChangeNotifications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    Role Updates
                  </h2>
                  <div className="bg-warning/20 text-warning-600 dark:text-warning-400 rounded-full px-2 py-1 text-xs font-medium">
                    {teamRoleChangeNotifications.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {teamRoleChangeNotifications.map((notification) => (
                    <TeamRoleChangeNotice
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismissRoleChange}
                    />
                  ))}
                </div>
              </div>
            )}
            {pendingTeamInvitations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    Team Invitations
                  </h2>
                  <div className="bg-warning/20 text-warning-600 dark:text-warning-400 rounded-full px-2 py-1 text-xs font-medium">
                    {pendingTeamInvitations.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {pendingTeamInvitations.map((invitation) => (
                    <TeamInvite
                      key={invitation.id}
                      invitation={invitation}
                      onRespond={handleTeamInvitation}
                    />
                  ))}
                </div>
              </div>
            )}
            {teamDeclineNotifications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    Declined Invitations
                  </h2>
                  <div className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs font-medium">
                    {teamDeclineNotifications.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {teamDeclineNotifications.map((notification) => (
                    <TeamDeclineNotice
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismissDecline}
                    />
                  ))}
                </div>
              </div>
            )}
            {pendingInvitations.length > 0 && (
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
            )}
            {historyTeamInvitations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium tracking-tight">
                    History
                  </h2>
                  <div className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs font-medium">
                    {historyTeamInvitations.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {historyTeamInvitations.map((invitation) => (
                    <TeamInvite
                      key={invitation.id}
                      invitation={invitation}
                      onRespond={handleTeamInvitation}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<InboxLine />}
            title="You're all caught up"
            description="Team invites, shared boards and folders, and team updates land here."
            action={
              <Button variant="outline" onClick={() => void refetch()}>
                <Refresh className="h-4 w-4" />
                Refresh
              </Button>
            }
          />
        )}
      </Skeleton>
    </div>
  );
}
