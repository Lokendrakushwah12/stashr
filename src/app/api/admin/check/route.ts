import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/admin/check - Check if current user is admin
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { isAdmin: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user is admin
    const isAdmin = session.user.email === "lokendrakushwah8051@gmail.com";

    return NextResponse.json(
      {
        isAdmin,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking admin status:", error);

    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 },
    );
  }
}
