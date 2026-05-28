"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTeam } from "@/lib/contexts/team-context";
import {
  useUpgradeDialog,
  handleApiResponse,
} from "@/components/upgrade-dialog";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamAvatar } from "./TeamAvatar";

interface TeamSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function TeamSwitcher({
  compact = false,
  className,
}: TeamSwitcherProps = {}) {
  const {
    teams,
    currentTeam,
    isLoading,
    switchTeam,
    refresh,
    setCurrentTeamLocal,
  } = useTeam();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { showUpgrade } = useUpgradeDialog();

  if (isLoading || !currentTeam) {
    return compact ? (
      <div
        className={cn("h-9 w-9 p-1", className)}
        aria-busy="true"
        aria-label="Loading team"
      >
        <div className="bg-muted h-6 w-6 animate-pulse rounded-xs" />
      </div>
    ) : (
      <div
        className={cn(
          "flex h-9 w-full items-center gap-2 pr-2 pl-1.5",
          className,
        )}
        aria-busy="true"
        aria-label="Loading team"
      >
        <div className="bg-muted h-6 w-6 shrink-0 animate-pulse rounded-xs" />
        <div className="bg-muted h-4 w-24 animate-pulse rounded-xs" />
      </div>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {compact ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "data-[state=open]:bg-secondary h-9 w-9 p-1",
                className,
              )}
              aria-label={currentTeam.name}
            >
              <TeamAvatar
                name={currentTeam.name}
                logoUrl={currentTeam.logoUrl}
                size={24}
              />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "data-[state=open]:bg-secondary h-9 w-full justify-start gap-2 pr-2 pl-1.5",
                className,
              )}
            >
              <TeamAvatar
                name={currentTeam.name}
                logoUrl={currentTeam.logoUrl}
                size={24}
              />
              <span className="flex-1 truncate text-left text-sm font-medium">
                {currentTeam.name}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-1">
          <div className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium">
            Teams
          </div>
          <div className="max-h-64 overflow-y-auto">
            {teams.map((team) => {
              const active = team.id === currentTeam.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    switchTeam(team.id);
                    setOpen(false);
                  }}
                  className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                >
                  <TeamAvatar
                    name={team.name}
                    logoUrl={team.logoUrl}
                    size={28}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{team.name}</div>
                    <div className="text-muted-foreground -mt-0.5 text-xs capitalize">
                      {team.role} · {team.memberCount} member
                      {team.memberCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <div className="my-1 border-t" />
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              // Pre-check: try to gate at click time on free plan
              try {
                // Just open the dialog; server enforces the limit on submit
                setCreateOpen(true);
              } catch (e) {
                console.error(e);
              }
            }}
            className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
          >
            <Plus className="h-4 w-4" /> Create new team
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
          >
            <Settings className="h-4 w-4" /> Team settings
          </button>
        </PopoverContent>
      </Popover>

      <CreateTeamDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async (team) => {
          setCurrentTeamLocal(team);
          await refresh();
          router.refresh();
        }}
        onLimit={showUpgrade}
        handleApiResponse={handleApiResponse}
      />
    </>
  );
}
