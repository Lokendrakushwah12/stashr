// Admin configuration - centralized admin user management
export const ADMIN_CONFIG = {
  // Default user type for new users
  defaultUserType: 'user' as const,
  
  // Check if a user type is admin
  isAdminUserType: (userType: string | null | undefined): boolean => {
    return userType === 'admin';
  },
  
  // Get user type safely with fallback
  getUserType: (userType: string | null | undefined): 'admin' | 'user' => {
    return userType === 'admin' ? 'admin' : 'user';
  }
} as const;

// Type for admin configuration
export type AdminConfig = typeof ADMIN_CONFIG;
