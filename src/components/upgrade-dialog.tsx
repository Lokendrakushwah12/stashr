"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface PlanLimitInfo {
  limitKey: string;
  limit: number;
  planId: string;
}

interface UpgradeDialogContextValue {
  showUpgrade: (info: PlanLimitInfo) => void;
}

const UpgradeDialogContext = createContext<
  UpgradeDialogContextValue | undefined
>(undefined);

const LIMIT_LABELS: Record<string, string> = {
  teamsPerUser: "team",
  boardsPerTeam: "board in this team",
  foldersPerTeam: "folder in this team",
  bookmarksPerFolder: "bookmark in this folder",
  membersPerTeam: "member in this team",
};

export function UpgradeDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [info, setInfo] = useState<PlanLimitInfo | null>(null);

  const showUpgrade = useCallback((next: PlanLimitInfo) => setInfo(next), []);
  const value = useMemo(() => ({ showUpgrade }), [showUpgrade]);

  const label = info ? (LIMIT_LABELS[info.limitKey] ?? "item") : "item";

  return (
    <UpgradeDialogContext.Provider value={value}>
      {children}
      <Dialog open={!!info} onOpenChange={(open) => !open && setInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You&apos;ve reached your Free plan limit</DialogTitle>
            <DialogDescription className="px-3 pt-1">
              Your free plan allows up to <b>{info?.limit}</b> {label}
              {info && info.limit !== 1 ? "s" : ""}. Upgrade to Pro to add more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-3 pt-2">
            <Button variant="ghost" onClick={() => setInfo(null)}>
              Not now
            </Button>
            <Button
              onClick={() => {
                setInfo(null);
                // Payment integration TODO
                window.alert("Payments coming soon!");
              }}
            >
              Upgrade to Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UpgradeDialogContext.Provider>
  );
}

export function useUpgradeDialog() {
  const ctx = useContext(UpgradeDialogContext);
  if (!ctx)
    throw new Error(
      "useUpgradeDialog must be used within UpgradeDialogProvider",
    );
  return ctx;
}

/**
 * Helper: wraps a fetch promise, detects PLAN_LIMIT_REACHED 402 responses
 * and shows the upgrade dialog. Returns the parsed JSON either way.
 */
export async function handleApiResponse<T>(
  res: Response,
  onLimit: (info: PlanLimitInfo) => void,
): Promise<T> {
  const data = (await res.json()) as T & {
    code?: string;
    limitKey?: string;
    limit?: number;
    planId?: string;
    error?: string;
  };
  if (!res.ok && data?.code === "PLAN_LIMIT_REACHED") {
    onLimit({
      limitKey: data.limitKey ?? "item",
      limit: data.limit ?? 0,
      planId: data.planId ?? "free",
    });
    throw new Error(data.error ?? "Plan limit reached");
  }
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}
