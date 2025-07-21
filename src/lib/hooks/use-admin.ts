import { useQuery } from "@tanstack/react-query";
import type { 
  AdminCheckResponse, 
  AdminStatsResponse, 
  AdminUsersResponse, 
  AdminAnalyticsResponse 
} from "@/types";

// Admin query keys
export const adminKeys = {
  all: ["admin"] as const,
  check: () => [...adminKeys.all, "check"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  analytics: () => [...adminKeys.all, "analytics"] as const,
};

// Admin check hook
export function useAdminCheck() {
  return useQuery({
    queryKey: adminKeys.check(),
    queryFn: async (): Promise<AdminCheckResponse> => {
      const response = await fetch("/api/admin/check");
      if (!response.ok) {
        throw new Error("Failed to check admin status");
      }
      return response.json() as Promise<AdminCheckResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Admin stats hook
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async (): Promise<AdminStatsResponse> => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return response.json() as Promise<AdminStatsResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Admin users hook
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: async (): Promise<AdminUsersResponse> => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json() as Promise<AdminUsersResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Admin analytics hook
export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: async (): Promise<AdminAnalyticsResponse> => {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json() as Promise<AdminAnalyticsResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
