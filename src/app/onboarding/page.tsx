"use client";

import { CreateTeamDialog } from "@/components/team/CreateTeamDialog";
import {
  UpgradeDialogProvider,
  handleApiResponse,
  useUpgradeDialog,
} from "@/components/upgrade-dialog";
import { TeamProvider, useTeam } from "@/lib/contexts/team-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function OnboardingInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teams, currentTeam, setCurrentTeamLocal, isLoading } = useTeam();
  const [open, setOpen] = useState(true);
  const { showUpgrade } = useUpgradeDialog();

  // If the user already has teams (e.g. existing user auto-migrated), bounce
  useEffect(() => {
    if (status !== "authenticated") return;
    if (isLoading) return;
    if (currentTeam) {
      router.replace("/board");
    }
  }, [status, isLoading, currentTeam, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
        Loading…
      </div>
    );
  }

  if (status !== "authenticated") {
    router.replace("/auth/signin");
    return null;
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Welcome to Stashr</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hi {session.user?.name?.split(" ")[0] ?? "there"} — let&apos;s set up
          your team to get started.
        </p>
      </div>
      <CreateTeamDialog
        open={open}
        onOpenChange={setOpen}
        required
        handleApiResponse={handleApiResponse}
        onLimit={showUpgrade}
        onCreated={async (team) => {
          setCurrentTeamLocal(team);
          router.replace("/board");
        }}
      />
      <p className="text-muted-foreground mt-4 text-xs">
        You already have {teams.length} team{teams.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <TeamProvider>
      <UpgradeDialogProvider>
        <OnboardingInner />
      </UpgradeDialogProvider>
    </TeamProvider>
  );
}
