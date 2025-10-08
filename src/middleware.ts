import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/board/:path*",
    "/inbox/:path*",
    "/profile/:path*",
    "/api/folders/:path*",
    "/api/bookmarks/:path*",
    "/api/collaborations/:path*",
  ],
}; 