import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to check if a user is admin
export function isAdmin(user: { userType?: string | null } | null | undefined): boolean {
  return user?.userType === "admin";
}

// Utility function to get user type safely
export function getUserType(user: { userType?: string | null } | null | undefined): string | null {
  return user?.userType ?? null;
}
