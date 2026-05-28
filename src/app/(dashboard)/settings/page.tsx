"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  handleApiResponse,
  useUpgradeDialog,
} from "@/components/upgrade-dialog";
import {
  useTeam,
  type TeamRole,
  type TeamTheme,
} from "@/lib/contexts/team-context";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const THEME_PRESETS: Array<{ id: TeamTheme; label: string; swatch: string }> = [
  { id: "default", label: "Indigo", swatch: "oklch(0.6628 0.1834 280.86)" },
  { id: "ocean", label: "Sage", swatch: "oklch(0.632 0.058 118.39)" },
  { id: "forest", label: "Mint", swatch: "oklch(0.8013 0.1096 144.28)" },
];

interface Member {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: TeamRole;
  status: "pending" | "active" | "declined";
  userId?: string;
}

const ROLE_OPTIONS: TeamRole[] = ["admin", "editor", "viewer"];

export default function SettingsPage() {
  const { currentTeam, refresh, setCurrentTeamLocal } = useTeam();
  const { showUpgrade } = useUpgradeDialog();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [theme, setTheme] = useState<TeamTheme>("default");
  const [customColor, setCustomColor] = useState("#4f46e5");
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("editor");
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (currentTeam) {
      setName(currentTeam.name);
      setLogoUrl(currentTeam.logoUrl ?? "");
      setTheme(currentTeam.theme ?? "default");
      if (currentTeam.customColor) setCustomColor(currentTeam.customColor);
    }
  }, [currentTeam]);

  const fetchMembers = async () => {
    if (!currentTeam) return;
    try {
      const res = await fetch(`/api/teams/${currentTeam.id}/members`);
      const data = (await res.json()) as { members?: Member[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load members");
      setMembers(data.members ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load members";
      toast.error(msg);
    }
  };

  useEffect(() => {
    void fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam?.id]);

  if (!currentTeam) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 py-6">
        <section className="space-y-4">
          <header className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-64" />
          </header>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-48" />
        </section>

        <section className="space-y-4">
          <header className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-72" />
          </header>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <header className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-80" />
          </header>
          <div className="rounded-xl border p-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <ul className="divide-y rounded-xl border">
            {[0, 1].map((i) => (
              <li key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  const canManage =
    currentTeam.role === "owner" || currentTeam.role === "admin";

  const handleSaveTeam = async () => {
    if (!canManage) return;
    setSavingTeam(true);
    try {
      const res = await fetch(`/api/teams/${currentTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logoUrl }),
      });
      const data = (await res.json()) as {
        team?: {
          id: string;
          name: string;
          logoUrl?: string;
          planId: "free" | "pro";
          ownerId: string;
          slug: string;
        };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      if (data.team) {
        setCurrentTeamLocal({
          ...currentTeam,
          name: data.team.name,
          logoUrl: data.team.logoUrl,
        });
      }
      toast.success("Team updated");
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSavingTeam(false);
    }
  };

  const handleSaveTheme = async (
    nextTheme: TeamTheme,
    nextCustomColor?: string,
  ) => {
    if (!canManage) return;
    setSavingTheme(true);
    try {
      const payload: { theme: TeamTheme; customColor?: string } = {
        theme: nextTheme,
      };
      if (nextTheme === "custom")
        payload.customColor = nextCustomColor ?? customColor;
      const res = await fetch(`/api/teams/${currentTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        team?: { theme?: TeamTheme; customColor?: string };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to save theme");
      if (data.team) {
        setCurrentTeamLocal({
          ...currentTeam,
          theme: data.team.theme ?? "default",
          customColor: data.team.customColor || undefined,
        });
      }
      toast.success("Theme updated");
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save theme";
      toast.error(msg);
    } finally {
      setSavingTheme(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !canManage) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/teams/${currentTeam.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      await handleApiResponse(res, showUpgrade);
      toast.success(`Invited ${inviteEmail}`);
      setInviteEmail("");
      await fetchMembers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to invite";
      if (!msg.toLowerCase().includes("plan limit")) toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: TeamRole) => {
    try {
      const res = await fetch(
        `/api/teams/${currentTeam.id}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      toast.success("Role updated");
      await fetchMembers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      toast.error(msg);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(
        `/api/teams/${currentTeam.id}/members/${removeTarget.id}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to remove");
      toast.success("Member removed");
      setRemoveTarget(null);
      await fetchMembers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove";
      toast.error(msg);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Team</h2>
          <p className="text-muted-foreground text-sm">
            Update your team&apos;s name and logo.
          </p>
        </header>
        <div className="bg-background flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
          <ImageUpload
            currentImage={logoUrl}
            onUploadComplete={(url) => setLogoUrl(url)}
            onRemove={() => setLogoUrl("")}
            fallbackText={name.charAt(0).toUpperCase() || "T"}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canManage}
              maxLength={80}
            />
          </div>
          {canManage && (
            <Button
              onClick={handleSaveTeam}
              isLoading={savingTeam}
              disabled={
                !name.trim() ||
                (name === currentTeam.name &&
                  logoUrl === (currentTeam.logoUrl ?? ""))
              }
            >
              Save
            </Button>
          )}
        </div>
        <div className="text-muted-foreground text-xs">
          Plan: <b className="capitalize">{currentTeam.planId}</b> · Your role:{" "}
          <b className="capitalize">{currentTeam.role}</b>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-muted-foreground text-sm">
            Pick a preset or set a custom accent color for this team.
          </p>
        </header>
        <div className="grid h-24 grid-cols-2 gap-3 sm:grid-cols-4">
          {THEME_PRESETS.map((preset) => {
            const active = theme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={!canManage || savingTheme}
                onClick={() => {
                  setTheme(preset.id);
                  void handleSaveTheme(preset.id);
                }}
                className={cn(
                  "group bg-background relative flex flex-col items-center gap-1 rounded-lg border p-1 text-left transition",
                  active
                    ? "border-primary ring-primary/30 ring-2"
                    : "hover:border-foreground/30",
                  (!canManage || savingTheme) &&
                    "cursor-not-allowed opacity-60",
                )}
              >
                <div className="flex h-full w-full gap-0.5">
                  <div
                    className="h-full w-1/4 rounded opacity-50"
                    style={{ background: preset.swatch }}
                  />
                  <div
                    className="h-full w-3/4 rounded"
                    style={{ background: preset.swatch }}
                  />
                </div>
                <span className="text-sm font-medium">{preset.label}</span>
                {active && (
                  <Check className="text-primary absolute top-2 right-2 h-4 w-4" />
                )}
              </button>
            );
          })}
          <button
            type="button"
            disabled={!canManage || savingTheme}
            onClick={() => {
              setTheme("custom");
              void handleSaveTheme("custom", customColor);
            }}
            className={cn(
              "group bg-background relative flex flex-col items-center gap-2 rounded-lg border p-3 text-left transition",
              theme === "custom"
                ? "border-primary ring-primary/30 ring-2"
                : "hover:border-foreground/30",
              (!canManage || savingTheme) && "cursor-not-allowed opacity-60",
            )}
          >
            <div className="flex h-full w-full gap-0.5">
              <div
                className="h-full w-1/4 rounded opacity-50"
                style={{ background: customColor }}
              />
              <div
                className="h-full w-3/4 rounded"
                style={{ background: customColor }}
              />
            </div>
            <span className="text-sm font-medium">Custom</span>
            {theme === "custom" && (
              <Check className="text-primary absolute top-2 right-2 h-4 w-4" />
            )}
          </button>
        </div>
        {theme === "custom" && canManage && (
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-color" className="text-sm">
              Hex color
            </Label>
            <input
              id="custom-color-picker"
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="bg-background h-9 w-12 cursor-pointer rounded border"
              disabled={savingTheme}
            />
            <Input
              id="custom-color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-32 font-mono text-sm"
              placeholder="#4f46e5"
              disabled={savingTheme}
            />
            <Button
              onClick={() => void handleSaveTheme("custom", customColor)}
              isLoading={savingTheme}
              disabled={
                !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customColor) ||
                customColor === (currentTeam.customColor ?? "")
              }
            >
              Apply
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-muted-foreground text-sm">
            Invite people to give them access to all boards and bookmarks in
            this team.
          </p>
        </header>
        {canManage && (
          <form
            onSubmit={handleInvite}
            className="bg-background flex flex-col gap-2 rounded-lg border p-4 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="teammate@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={inviteRole}
              onValueChange={(v) => setInviteRole(v as TeamRole)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              isLoading={inviting}
              disabled={!inviteEmail.trim()}
            >
              Invite
            </Button>
          </form>
        )}
        <ul className="bg-background divide-y rounded-lg border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={m.image ?? ""} alt={m.email} />
                <AvatarFallback>
                  {m.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">
                  {m.name ?? m.email}{" "}
                  {m.status === "pending" && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      (pending)
                    </span>
                  )}
                </div>
                {m.name && (
                  <div className="text-muted-foreground truncate text-xs">
                    {m.email}
                  </div>
                )}
              </div>
              {m.role === "owner" ? (
                <span className="text-muted-foreground text-xs capitalize">
                  owner
                </span>
              ) : canManage ? (
                <Select
                  value={m.role}
                  onValueChange={(v) => handleRoleChange(m.id, v as TeamRole)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-muted-foreground text-xs capitalize">
                  {m.role}
                </span>
              )}
              {canManage && m.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoveTarget(m)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <ConfirmationDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="Remove member"
        description={
          removeTarget
            ? `${removeTarget.name ?? removeTarget.email} will lose access to all boards and bookmarks in this team.`
            : ""
        }
        confirmText="Remove"
        variant="destructive"
        onConfirm={confirmRemove}
        isLoading={removing}
      />
    </div>
  );
}
