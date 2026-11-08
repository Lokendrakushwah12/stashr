import "server-only";
import connectDB from "@/lib/mongodb";

export type BoardActivityAction =
  | "entry.created"
  | "entry.updated"
  | "entry.deleted"
  | "board.renamed"
  | "folder.linked"
  | "folder.unlinked"
  | "board.icon"
  | "board.themed";

export interface BoardActivityInput {
  boardId: string;
  actorId: string;
  actorName: string;
  actorImage?: string | null;
  action: BoardActivityAction;
  /** What it was about: a note's first line, the new name, the folder. */
  detail?: string;
}

/**
 * Append-only board audit log in a raw `boardactivity` collection.
 * ponytail: no index yet — board-scoped scans are fine at this size; add
 * { boardId: 1, createdAt: -1 } if boards grow to thousands of events.
 */
async function activity() {
  return (await connectDB()).collection("boardactivity");
}

/** Never fails the user's action: a lost log line beats a failed save. */
export async function logBoardActivity(input: BoardActivityInput) {
  try {
    await (await activity()).insertOne({ ...input, createdAt: new Date() });
  } catch (error) {
    console.error("Failed to log board activity:", error);
  }
}

export async function listBoardActivity(boardId: string, limit = 100) {
  const rows = await (await activity())
    .find({ boardId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return rows.map((r) => ({
    id: String(r._id),
    actorId: r.actorId as string,
    actorName: r.actorName as string,
    actorImage: (r.actorImage as string | null | undefined) ?? null,
    action: r.action as BoardActivityAction,
    detail: (r.detail as string | undefined) ?? null,
    createdAt: (r.createdAt as Date).toISOString(),
  }));
}

export async function deleteBoardActivity(boardIds: string[]) {
  if (boardIds.length === 0) return;
  await (await activity()).deleteMany({ boardId: { $in: boardIds } });
}

/** A note's first line as plain text, for "deleted “…”". */
export function noteSnippet(markdown: string, max = 80): string {
  const line =
    markdown
      .split("\n")
      .map((l) => l.trim())
      .find(Boolean) ?? "";
  const text = line
    .replace(/^(?:[-*+]\s+\[[ xX]\]\s+|[-*+]\s+|\d+\.\s+|>\s*|#+\s+)/, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<\/?u>|[*_~`]/g, "")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
