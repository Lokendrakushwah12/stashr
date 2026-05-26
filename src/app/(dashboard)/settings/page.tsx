"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import {
  handleApiResponse,
  useUpgradeDialog,
} from "@/components/upgrade-dialog";
import { useTeam, type TeamRole } from "@/lib/contexts/team-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("editor");
  const [savingTeam, setSavingTeam] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (currentTeam) {
      setName(currentTeam.name);
      setLogoUrl(currentTeam.logoUrl ?? "");
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
      <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        Loading team…
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

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    try {
      const res = await fetch(
        `/api/teams/${currentTeam.id}/members/${memberId}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to remove");
      toast.success("Member removed");
      await fetchMembers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove";
      toast.error(msg);
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
                  onClick={() => handleRemove(m.id)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
