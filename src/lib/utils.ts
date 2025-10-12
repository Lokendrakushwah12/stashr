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

// Time formatting utilities
export function getRelativeTime(timestamp: string): string {
  if (timestamp === "now") return "now";
  
  try {
    // First try parsing the format "DD/MM/YYYY, HH:MM:SS"
    // use RegExp#exec instead of match
    const parts = /(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/.exec(timestamp);
    if (parts) {
      const [, day, month, year, hours, minutes, seconds] = parts;
      // Construct date string in ISO format: YYYY-MM-DDTHH:MM:SS
      const parsedDate = new Date(`${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}T${hours?.padStart(2, '0')}:${minutes?.padStart(2, '0')}:${seconds?.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime())) {
        return formatRelativeTime(parsedDate);
      }
    }
    
    // Fall back to standard date parsing
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return formatRelativeTime(date);
    }
    
    return timestamp;
  } catch {
    return timestamp;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return "1 year ago";
  return `${diffYears} years ago`;
}

export function formatExactDate(timestamp: string): string {
  if (timestamp === "now") return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  
  try {
    // First try parsing the format "DD/MM/YYYY, HH:MM:SS"
    const parts = /(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/.exec(timestamp);
    if (parts) {
      const [, day, month, year, hours, minutes] = parts;
      // Construct date string in ISO format: YYYY-MM-DDTHH:MM:SS
      const parsedDate = new Date(`${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}T${hours?.padStart(2, '0')}:${minutes?.padStart(2, '0')}`);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    
    // Fall back to standard date parsing
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    return timestamp;
  } catch {
    return timestamp;
  }
}
