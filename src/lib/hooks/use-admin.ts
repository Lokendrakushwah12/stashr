import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { 
  AdminStatsResponse, 
  AdminUsersResponse, 
  AdminAnalyticsResponse 
} from "@/types";

// Admin query keys
export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  analytics: () => [...adminKeys.all, "analytics"] as const,
};

// Admin status hook - checks from session (instant, no API call)
export function useAdminStatus() {
  const { data: session } = useSession();
  return {
    isAdmin: session?.user?.userType === "admin",
    isLoading: false,
    user: session?.user,
  };
}

// Admin stats hook - only called when actually needed
export function useAdminStats() {
  const { isAdmin } = useAdminStatus();
  
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
    enabled: isAdmin, // Only fetch if user is admin
  });
}

// Admin users hook - only called when actually needed
export function useAdminUsers() {
  const { isAdmin } = useAdminStatus();
  
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
    enabled: isAdmin, // Only fetch if user is admin
  });
}

// Admin analytics hook - only called when actually needed
export function useAdminAnalytics() {
  const { isAdmin } = useAdminStatus();
  
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
    enabled: isAdmin, // Only fetch if user is admin
  });
}
