import { env } from "@/env";

export type PlanId = "free" | "pro";

export interface PlanLimits {
  teamsPerUser: number;
  boardsPerTeam: number;
  foldersPerTeam: number;
  bookmarksPerFolder: number;
  membersPerTeam: number;
}

export const PLANS: Record<
  PlanId,
  { id: PlanId; name: string; limits: PlanLimits }
> = {
  free: {
    id: "free",
    name: "Free",
    limits: {
      teamsPerUser: 1,
      boardsPerTeam: 3,
      foldersPerTeam: 6,
      bookmarksPerFolder: 5,
      membersPerTeam: 3,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: {
      teamsPerUser: Infinity,
      boardsPerTeam: Infinity,
      foldersPerTeam: Infinity,
      bookmarksPerFolder: Infinity,
      membersPerTeam: Infinity,
    },
  },
};

export const DEFAULT_PLAN: PlanId = "free";

export function getPlanLimits(planId: PlanId): PlanLimits {
  return PLANS[planId]?.limits ?? PLANS[DEFAULT_PLAN].limits;
}

export function isUnlimitedAccessEnabled(): boolean {
  return (
    env.NODE_ENV !== "production" && process.env.DEV_UNLIMITED_ACCESS === "true"
  );
}

export type LimitKey = keyof PlanLimits;

export class PlanLimitError extends Error {
  public readonly statusCode = 402;
  constructor(
    public readonly limitKey: LimitKey,
    public readonly limit: number,
    public readonly planId: PlanId,
  ) {
    super(
      `Plan limit reached for ${limitKey} on ${planId} plan (max ${limit}).`,
    );
    this.name = "PlanLimitError";
  }

  toJSON() {
    return {
      error: this.message,
      code: "PLAN_LIMIT_REACHED",
      limitKey: this.limitKey,
      limit: this.limit,
      planId: this.planId,
    };
  }
}

export interface LimitCheckArgs {
  planId: PlanId;
  key: LimitKey;
  current: number;
}

export function assertWithinLimit({
  planId,
  key,
  current,
}: LimitCheckArgs): void {
  if (isUnlimitedAccessEnabled()) return;
  const limit = getPlanLimits(planId)[key];
  if (current >= limit) {
    throw new PlanLimitError(key, limit, planId);
  }
}
