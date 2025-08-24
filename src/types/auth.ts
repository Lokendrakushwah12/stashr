// Authentication Types
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userType?: 'admin' | 'user' | null;
}

// NextAuth type extensions
declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    userType?: 'admin' | 'user' | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'admin' | 'user' | null;
  }
}
