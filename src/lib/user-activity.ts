import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * Every user with when they last showed up, for the admin page.
 *
 * Content dates use createdAt, not updatedAt: the 11 June 2026 teams
 * migration rewrote updatedAt on every folder and bookmark, so it says when
 * the migration ran, not when the user did anything.
 */
export type UserActivity = {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  signupAt: Date;
  /** Stamped hourly by /api/user/seen; absent until the user returns. */
  lastSeenAt: Date | null;
  /** Newest thing they created: folder, bookmark, board, note or action. */
  lastContentAt: Date | null;
  /** max(lastSeenAt, lastContentAt, signupAt). */
  lastActivityAt: Date;
  folderCount: number;
  bookmarkCount: number;
  uniqueDomains: number;
};

type Grouped = { _id: string; n: number; last: Date | null };

const DAY = 24 * 60 * 60 * 1000;

export const daysSince = (date: Date) =>
  Math.floor((Date.now() - date.getTime()) / DAY);

export async function listUserActivity(): Promise<UserActivity[]> {
  const db = await connectDB();
  const group = (collection: string, userField = "userId") =>
    db
      .collection(collection)
      .aggregate<Grouped>([
        {
          $group: {
            _id: `$${userField}`,
            n: { $sum: 1 },
            last: { $max: "$createdAt" },
          },
        },
      ])
      .toArray();

  const [users, folders, bookmarks, domains, ...rest] = await Promise.all([
    db
      .collection<{
        _id: mongoose.Types.ObjectId;
        name?: string;
        email?: string;
        image?: string | null;
        lastSeenAt?: Date;
      }>("users")
      .find({}, { projection: { name: 1, email: 1, image: 1, lastSeenAt: 1 } })
      .toArray(),
    group("folders"),
    group("bookmarks"),
    db
      .collection("bookmarks")
      .aggregate<{ _id: string; n: number }>([
        { $group: { _id: { u: "$userId", d: { $substr: ["$url", 0, 50] } } } },
        { $group: { _id: "$_id.u", n: { $sum: 1 } } },
      ])
      .toArray(),
    group("boards"),
    group("boardcards"),
    group("boardtimelineentries"),
    group("boardactivity", "actorId"),
  ]);

  const byId = (rows: Array<{ _id: string; n: number }>) =>
    new Map(rows.map((r) => [String(r._id), r]));
  const folderMap = byId(folders);
  const bookmarkMap = byId(bookmarks);
  const domainMap = byId(domains);
  const contentMaps = [folders, bookmarks, ...rest].map((rows) =>
    byId(rows),
  ) as Array<Map<string, Grouped>>;

  return users.map((u) => {
    const id = String(u._id);
    const times = contentMaps
      .map((m) => m.get(id)?.last)
      .filter((d): d is Date => d instanceof Date)
      .map((d) => d.getTime());
    const lastContentAt = times.length ? new Date(Math.max(...times)) : null;
    const signupAt = u._id.getTimestamp();
    const lastSeenAt = u.lastSeenAt ?? null;
    const lastActivityAt = new Date(
      Math.max(
        signupAt.getTime(),
        lastSeenAt?.getTime() ?? 0,
        lastContentAt?.getTime() ?? 0,
      ),
    );
    return {
      id,
      name: u.name,
      email: u.email,
      image: u.image,
      signupAt,
      lastSeenAt,
      lastContentAt,
      lastActivityAt,
      folderCount: folderMap.get(id)?.n ?? 0,
      bookmarkCount: bookmarkMap.get(id)?.n ?? 0,
      uniqueDomains: domainMap.get(id)?.n ?? 0,
    };
  });
}
