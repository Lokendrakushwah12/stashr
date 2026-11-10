import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const HOUR = 60 * 60 * 1000;

// POST /api/user/seen - stamps users.lastSeenAt (at most hourly) so the admin
// page can tell visitors from people who only stopped editing.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!mongoose.isValidObjectId(session.user.id)) {
    return NextResponse.json({ error: "Bad user id" }, { status: 400 });
  }

  const db = await connectDB();
  const now = new Date();
  await db.collection("users").updateOne(
    {
      _id: new mongoose.Types.ObjectId(session.user.id),
      $or: [
        { lastSeenAt: { $exists: false } },
        { lastSeenAt: { $lt: new Date(now.getTime() - HOUR) } },
      ],
    },
    { $set: { lastSeenAt: now } },
  );
  return new NextResponse(null, { status: 204 });
}
