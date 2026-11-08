"use client";

import { LinkChip } from "@/components/board/MarkdownPreview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { BoardActivity, BoardTimelineEntry, Folder } from "@/types";
import { ImageIcon, Link2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const VERB: Record<BoardActivity["action"], string> = {
  "entry.created": "added a note",
  "entry.updated": "edited a note",
  "entry.deleted": "deleted a note",
  "board.renamed": "renamed the board",
  "folder.linked": "linked a folder",
  "folder.unlinked": "unlinked a folder",
};

const fullDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const shortDate = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

/** "now", "5m", "3h", "2d", then "Nov 8" */
function shortAgo(iso: string): string {
  const date = new Date(iso);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h`;
  if (mins < 60 * 24 * 7) return `${Math.floor(mins / (60 * 24))}d`;
  return shortDate.format(date);
}

function ActivityRow({ item }: { item: BoardActivity }) {
  const deleted = item.action === "entry.deleted";
  return (
    <li className="flex gap-2.5">
      <Avatar className="mt-0.5 size-5 rounded-full">
        <AvatarImage src={item.actorImage ?? ""} alt="" />
        <AvatarFallback className="rounded-full text-[10px]">
          {item.actorName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-5">
          <bdi className="font-medium">{item.actorName}</bdi>{" "}
          <span className="text-muted-foreground">{VERB[item.action]}</span>
        </p>
        {item.detail && (
          <p
            title={item.detail}
            className={cn(
              "text-muted-foreground truncate text-xs leading-5",
              deleted && "decoration-muted-foreground/60 line-through",
            )}
          >
            “{item.detail}”
          </p>
        )}
      </div>
      <time
        dateTime={item.createdAt}
        title={fullDate.format(new Date(item.createdAt))}
        className="text-muted-foreground shrink-0 text-xs leading-5 tabular-nums"
      >
        {shortAgo(item.createdAt)}
      </time>
    </li>
  );
}

const URL_RE = /https?:\/\/[^\s<>()[\]"'`]+/g;
const PREVIEW_COUNT = { links: 8, images: 9, activity: 6 };

/** Every distinct URL / image across the timeline, newest entry first. */
export function collectMedia(entries: BoardTimelineEntry[]) {
  const links = new Set<string>();
  const images = new Set<string>();
  const newestFirst = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const entry of newestFirst) {
    for (const url of entry.content.match(URL_RE) ?? []) {
      links.add(url.replace(/[.,;:!?]+$/, ""));
    }
    for (const img of entry.images ?? []) images.add(img);
  }
  return { links: [...links], images: [...images] };
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-medium">
        {title}
        {!!count && (
          <span className="text-muted-foreground ml-1.5 font-normal tabular-nums">
            {count}
          </span>
        )}
      </h3>
      {children}
    </section>
  );
}

/** Empty state: a faint outline of what will appear, plus one line. */
function Ghost({
  kind,
  children,
}: {
  kind: "links" | "images";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      {kind === "links" ? (
        <div className="flex flex-col items-start gap-1.5" aria-hidden>
          {["w-40", "w-28"].map((w) => (
            <div
              key={w}
              className="border-border/70 flex h-6 items-center gap-1.5 rounded-md border border-dashed px-1.5"
            >
              <Link2 className="text-muted-foreground/40 size-3.5" />
              <div className={cn("bg-muted-foreground/10 h-1.5 rounded", w)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="border-border/70 flex aspect-square items-center justify-center rounded-md border border-dashed"
            >
              {i === 1 && (
                <ImageIcon className="text-muted-foreground/40 size-4" />
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-muted-foreground text-xs">{children}</p>
    </div>
  );
}

function ShowAll({
  total,
  limit,
  expanded,
  onToggle,
}: {
  total: number;
  limit: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (total <= limit) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground text-xs"
    >
      {expanded ? "Show less" : `Show all ${total}`}
    </button>
  );
}

export default function BoardSidePanel({
  entries,
  activity,
  folders,
  linkedFolder,
  canEdit,
  onLinkFolder,
}: {
  entries: BoardTimelineEntry[];
  activity: BoardActivity[];
  folders: Folder[];
  linkedFolder?: { id: string; name: string; color: string };
  canEdit: boolean;
  onLinkFolder: (folderId: string | null) => void;
}) {
  const { links, images } = useMemo(() => collectMedia(entries), [entries]);
  const [allLinks, setAllLinks] = useState(false);
  const [allImages, setAllImages] = useState(false);
  const [allActivity, setAllActivity] = useState(false);

  const shownLinks = allLinks ? links : links.slice(0, PREVIEW_COUNT.links);
  const shownImages = allImages
    ? images
    : images.slice(0, PREVIEW_COUNT.images);

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <Section title="Linked folder">
        {linkedFolder ? (
          <div className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: linkedFolder.color }}
            />
            <Link
              href={`/bookmarks/${linkedFolder.id}`}
              className="min-w-0 flex-1 truncate text-sm hover:underline"
            >
              {linkedFolder.name}
            </Link>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLinkFolder(null)}
                className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs"
              >
                Unlink
              </Button>
            )}
          </div>
        ) : canEdit ? (
          <Select
            value="none"
            onValueChange={(v) => onLinkFolder(v === "none" ? null : v)}
          >
            <SelectTrigger className="h-8 w-full text-sm">
              <SelectValue placeholder="Link a bookmark folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked folder</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder._id} value={folder._id!}>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: folder.color ?? "#3b82f6" }}
                    />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-muted-foreground text-sm">None</p>
        )}
      </Section>

      <Section title="Links" count={links.length}>
        {links.length === 0 ? (
          <Ghost kind="links">Links shared in this board collect here.</Ghost>
        ) : (
          <div className="flex flex-col items-start gap-1.5">
            {shownLinks.map((url) => (
              <LinkChip key={url} href={url} />
            ))}
            <ShowAll
              total={links.length}
              limit={PREVIEW_COUNT.links}
              expanded={allLinks}
              onToggle={() => setAllLinks((v) => !v)}
            />
          </div>
        )}
      </Section>

      <Section title="Images" count={images.length}>
        {images.length === 0 ? (
          <Ghost kind="images">Images shared in this board collect here.</Ghost>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {shownImages.map((src) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="bg-muted aspect-square overflow-hidden rounded-md transition-opacity hover:opacity-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </a>
              ))}
            </div>
            <ShowAll
              total={images.length}
              limit={PREVIEW_COUNT.images}
              expanded={allImages}
              onToggle={() => setAllImages((v) => !v)}
            />
          </div>
        )}
      </Section>

      <Section title="Activity">
        {activity.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Who added, edited or deleted what, and when, shows up here.
          </p>
        ) : (
          <div className="space-y-3">
            <ol className="space-y-3">
              {(allActivity
                ? activity
                : activity.slice(0, PREVIEW_COUNT.activity)
              ).map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ol>
            <ShowAll
              total={activity.length}
              limit={PREVIEW_COUNT.activity}
              expanded={allActivity}
              onToggle={() => setAllActivity((v) => !v)}
            />
          </div>
        )}
      </Section>
    </aside>
  );
}
