"use client";

import { queryClient } from "@/lib/query-client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TeamRole = "owner" | "admin" | "editor" | "viewer";

export type TeamTheme = "default" | "ocean" | "forest" | "custom";

export interface Team {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  planId: "free" | "pro";
  ownerId: string;
  role: TeamRole;
  memberCount: number;
  theme?: TeamTheme;
  customColor?: string;
}

interface TeamContextValue {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  switchTeam: (teamId: string) => void;
  refresh: () => Promise<void>;
  setCurrentTeamLocal: (team: Team) => void;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

const STORAGE_KEY = "stashr.currentTeamId";

// Module-level holder for the current team id. The fetch interceptor reads
// from this so that the value survives TeamProvider remounts (e.g. when
// navigating from /onboarding into the dashboard).
let activeTeamId: string | null =
  typeof window !== "undefined"
    ? window.localStorage.getItem(STORAGE_KEY)
    : null;

export function setActiveTeamId(teamId: string | null) {
  activeTeamId = teamId;
  if (typeof window !== "undefined") {
    if (teamId) window.localStorage.setItem(STORAGE_KEY, teamId);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
}

// Pick a readable foreground (black or white) for an arbitrary hex color
// using the WCAG relative-luminance formula. Threshold tuned so light
// pastels get dark text and saturated mid-tones get white text.
function readableForeground(hex: string): string {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "oklch(1 0 0)";
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return L > 0.5 ? "oklch(0.15 0 0)" : "oklch(1 0 0)";
}

// Patch window.fetch ONCE to attach x-team-id header for same-origin /api/* calls.
function installFetchInterceptor() {
  if (typeof window === "undefined") return;
  const w = window as Window & { __stashrFetchPatched?: boolean };
  if (w.__stashrFetchPatched) return;
  const original = window.fetch.bind(window);
  w.__stashrFetchPatched = true;

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const teamId = activeTeamId;
      if (teamId) {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        if (url.startsWith("/api/")) {
          const headers = new Headers(
            init?.headers ?? (input instanceof Request ? input.headers : {}),
          );
          if (!headers.has("x-team-id")) headers.set("x-team-id", teamId);
          return original(input, { ...init, headers });
        }
      }
    } catch {
      // fall through
    }
    return original(input, init);
  }) as typeof window.fetch;
}

if (typeof window !== "undefined") {
  installFetchInterceptor();
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    // Wait for the session to settle. Do NOT flip isLoading to false while
    // status === "loading", or the onboarding-redirect effect will fire as
    // soon as status flips to "authenticated" but before /api/teams resolves.
    if (status === "loading") return;
    if (status !== "authenticated") {
      setTeams([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/teams");
      if (!res.ok) return;
      const data = (await res.json()) as { teams: Team[] };
      setTeams(data.teams);
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      const next =
        data.teams.find((t) => t.id === stored) ?? data.teams[0] ?? null;
      setCurrentTeam(next);
      setActiveTeamId(next?.id ?? null);
    } catch (e) {
      console.error("Failed to load teams", e);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  // Apply the current team's theme to <html>. Preset themes use the
  // data-theme attribute (matched by [data-theme="..."] in globals.css);
  // custom uses an inline --primary so any user-picked hex works.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const theme = currentTeam?.theme ?? "default";
    if (theme === "default") {
      root.removeAttribute("data-theme");
    } else {
      root.dataset.theme = theme;
    }
    if (theme === "custom" && currentTeam?.customColor) {
      root.style.setProperty("--primary", currentTeam.customColor);
      root.style.setProperty("--ring", currentTeam.customColor);
      root.style.setProperty(
        "--primary-foreground",
        readableForeground(currentTeam.customColor),
      );
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--primary-foreground");
    }
  }, [currentTeam?.theme, currentTeam?.customColor]);

  // Redirect to onboarding if authenticated but no teams
  useEffect(() => {
    if (isLoading) return;
    if (status !== "authenticated") return;
    if (teams.length === 0 && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [isLoading, status, teams, pathname, router]);

  const switchTeam = useCallback(
    (teamId: string) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;
      setCurrentTeam(team);
      setActiveTeamId(team.id);
      // Drop all cached team-scoped data; the next render refetches with the
      // new x-team-id header. Without this, useFolders/useBookmarks keep
      // serving the previous team's results from React Query cache.
      queryClient.clear();
      router.refresh();
    },
    [teams, router],
  );

  const setCurrentTeamLocal = useCallback((team: Team) => {
    setTeams((prev) => {
      const idx = prev.findIndex((t) => t.id === team.id);
      if (idx === -1) return [...prev, team];
      const next = [...prev];
      next[idx] = team;
      return next;
    });
    setCurrentTeam(team);
    setActiveTeamId(team.id);
    queryClient.clear();
  }, []);

  const value = useMemo<TeamContextValue>(
    () => ({
      teams,
      currentTeam,
      isLoading,
      switchTeam,
      refresh: fetchTeams,
      setCurrentTeamLocal,
    }),
    [
      teams,
      currentTeam,
      isLoading,
      switchTeam,
      fetchTeams,
      setCurrentTeamLocal,
    ],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within a TeamProvider");
  return ctx;
}
