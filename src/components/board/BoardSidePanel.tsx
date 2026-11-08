"use client";

import { LinkChip } from "@/components/board/MarkdownPreview";
import { Button } from "@/components/ui/button";
import ImageModal from "@/components/ui/image-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BOARD_EMOJI,
  BOARD_THEMES,
  isBoardThemeId,
  resolveTheme,
  type BoardThemeId,
} from "@/lib/board-themes";
import { ThemePicker, type ThemeChoice } from "@/components/board/ThemePicker";
import { cn } from "@/lib/utils";
import type { BoardActivity, BoardTimelineEntry, Folder } from "@/types";
import { ImageIcon, Link2, SmilePlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const VERB: Record<BoardActivity["action"], string> = {
  "entry.created": "added a note",
  "entry.updated": "edited a note",
  "entry.deleted": "deleted a note",
  "board.renamed": "renamed the board",
  "folder.linked": "linked a folder",
  "folder.unlinked": "unlinked a folder",
  "board.icon": "changed the icon",
  "board.themed": "changed the theme",
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
    <li className="group relative flex gap-2.5 pb-3 last:pb-0">
      {/* Connects this avatar to the next row's, like an issue history. */}
      <span
        aria-hidden
        className="bg-border absolute top-6 bottom-0 left-[9.5px] w-px group-last:hidden"
      />
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
const MD_IMAGE_RE = /!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g;
const PREVIEW_COUNT = { links: 8, images: 9, activity: 6 };

/** Every distinct URL / image across the timeline, newest entry first. */
export function collectMedia(entries: BoardTimelineEntry[]) {
  const links = new Set<string>();
  const images = new Set<string>();
  const newestFirst = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const entry of newestFirst) {
    // Inline images (![](url)) belong under Images, not Links.
    const text = entry.content.replace(MD_IMAGE_RE, (_, src: string) => {
      images.add(src);
      return "";
    });
    for (const url of text.match(URL_RE) ?? []) {
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

export type AppearanceChange = { icon?: string } & Partial<ThemeChoice>;

function Appearance({
  icon,
  theme,
  themeImage,
  themeColor,
  themeOpacity,
  themeBlur,
  canEdit,
  onChange,
}: {
  icon?: string;
  theme?: string;
  themeImage?: string;
  themeColor?: string;
  themeOpacity?: number;
  themeBlur?: boolean;
  canEdit: boolean;
  onChange: (change: AppearanceChange) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const current: BoardThemeId = isBoardThemeId(theme) ? theme : "default";
  const spec = resolveTheme(current, {
    image: themeImage,
    color: themeColor,
    opacity: themeOpacity,
    blur: themeBlur,
  });

  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={!canEdit}>
          <button
            type="button"
            aria-label={icon ? "Change board icon" : "Add board icon"}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg text-xl transition-colors",
              icon
                ? "bg-muted hover:bg-muted/70"
                : "border-border text-muted-foreground hover:text-foreground border border-dashed",
              !canEdit && "pointer-events-none",
            )}
          >
            {icon ?? <SmilePlus className="size-4" />}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <div className="grid grid-cols-8 gap-0.5">
            {BOARD_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Use ${emoji}`}
                onClick={() => {
                  onChange({ icon: emoji });
                  setOpen(false);
                }}
                className={cn(
                  "hover:bg-muted flex size-7 items-center justify-center rounded-md text-base",
                  emoji === icon && "bg-muted",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
          {icon && (
            <button
              type="button"
              onClick={() => {
                onChange({ icon: "" });
                setOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground mt-2 w-full rounded-md px-2 py-1.5 text-left text-xs"
            >
              Remove icon
            </button>
          )}
        </PopoverContent>
      </Popover>

      <button
        type="button"
        disabled={!canEdit}
        onClick={() => setPickerOpen(true)}
        className="hover:bg-muted/60 flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors disabled:pointer-events-none"
      >
        <span
          className="border-border h-10 w-16 shrink-0 rounded-md border"
          style={{
            background:
              spec?.wallpaper ||
              "linear-gradient(135deg, var(--muted), var(--accent))",
          }}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm">
            {BOARD_THEMES[current].label}
          </span>
          {canEdit && (
            <span className="text-muted-foreground block text-xs">
              Change theme
            </span>
          )}
        </span>
      </button>
      <ThemePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        current={{
          theme: current,
          themeImage,
          themeColor,
          themeOpacity,
          themeBlur,
        }}
        onApply={(choice) => onChange(choice)}
      />
    </div>
  );
}

export default function BoardSidePanel({
  entries,
  activity,
  folders,
  linkedFolder,
  icon,
  theme,
  themeImage,
  themeColor,
  themeOpacity,
  themeBlur,
  canEdit,
  onLinkFolder,
  onAppearance,
}: {
  entries: BoardTimelineEntry[];
  activity: BoardActivity[];
  folders: Folder[];
  linkedFolder?: { id: string; name: string; color: string };
  icon?: string;
  theme?: string;
  themeImage?: string;
  themeColor?: string;
  themeOpacity?: number;
  themeBlur?: boolean;
  canEdit: boolean;
  onLinkFolder: (folderId: string | null) => void;
  onAppearance: (change: AppearanceChange) => void | Promise<void>;
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
      <Section title="Appearance">
        <Appearance
          icon={icon}
          theme={theme}
          themeImage={themeImage}
          themeColor={themeColor}
          themeOpacity={themeOpacity}
          themeBlur={themeBlur}
          canEdit={canEdit}
          onChange={onAppearance}
        />
      </Section>

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
                <div
                  key={src}
                  className="bg-muted aspect-square overflow-hidden rounded-md transition-opacity hover:opacity-80"
                >
                  <ImageModal
                    src={src}
                    alt="Board image"
                    className="h-full w-full object-cover"
                  />
                </div>
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
            <ol>
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
