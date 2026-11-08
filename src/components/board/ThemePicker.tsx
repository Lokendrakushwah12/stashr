"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BOARD_THEME_IDS,
  BOARD_THEMES,
  resolveTheme,
  themePanelStyle,
  type BoardThemeId,
  type CustomThemeInput,
} from "@/lib/board-themes";
import { Switch } from "@/components/ui/switch";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { ImagePlus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type ThemeChoice = {
  theme: BoardThemeId;
  themeImage?: string;
  themeColor?: string;
  /** Note opacity, 0.2–1 (custom). */
  themeOpacity?: number;
  /** Frost the wallpaper behind notes (custom). */
  themeBlur?: boolean;
};

const customOf = (c: ThemeChoice): CustomThemeInput => ({
  image: c.themeImage,
  color: c.themeColor,
  opacity: c.themeOpacity,
  blur: c.themeBlur,
});

function Bubble({ mine, children }: { mine?: boolean; children: string }) {
  return (
    <div
      data-note
      data-mine={mine || undefined}
      className={cn(
        "border-border max-w-[78%] rounded-2xl border px-3.5 py-2 text-sm leading-5",
        mine ? "self-end" : "self-start",
      )}
    >
      {children}
    </div>
  );
}

/** Live preview: the wallpaper with your notes and a teammate's. */
function Preview({ choice }: { choice: ThemeChoice }) {
  const spec = resolveTheme(choice.theme, customOf(choice));
  return (
    <div
      data-board-theme={spec ? choice.theme : undefined}
      style={spec ? themePanelStyle(spec) : undefined}
      className="bg-accent/30 text-foreground flex h-72 flex-col gap-2 overflow-hidden rounded-xl border p-4"
    >
      <p className="mb-1 text-center text-sm font-medium">
        Previewing {BOARD_THEMES[choice.theme].label}
      </p>
      <Bubble mine>Every theme gives this board its own look.</Bubble>
      <Bubble mine>Your notes show in this colour.</Bubble>
      <Bubble>Notes from teammates show in this colour.</Bubble>
      <Bubble mine>Apply it and everyone on the board sees it.</Bubble>
    </div>
  );
}

function Tile({
  id,
  selected,
  custom,
  onSelect,
}: {
  id: BoardThemeId;
  selected: boolean;
  custom: CustomThemeInput;
  onSelect: () => void;
}) {
  const spec = resolveTheme(id, custom);
  const { label } = BOARD_THEMES[id];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="group flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "ring-offset-background relative flex h-16 w-full flex-col justify-center gap-1 overflow-hidden rounded-lg border p-2 ring-offset-2 transition-shadow",
          selected
            ? "ring-foreground/70 ring-2"
            : "group-hover:ring-border group-hover:ring-2",
        )}
        style={spec ? { background: spec.wallpaper } : undefined}
      >
        {id === "custom" && !custom.image ? (
          <Plus className="text-muted-foreground mx-auto size-5" />
        ) : (
          <>
            <span
              className="h-2.5 w-10 self-end rounded-full"
              style={{ background: spec?.mine.bg || "var(--primary)" }}
            />
            <span
              className="h-2.5 w-8 self-start rounded-full"
              style={{
                background: spec?.theirs.bg || "var(--muted-foreground)",
                opacity: spec ? 1 : 0.4,
              }}
            />
          </>
        )}
      </span>
      <span className="text-muted-foreground group-aria-pressed:text-foreground w-full truncate text-center text-xs">
        {label}
      </span>
    </button>
  );
}

export function ThemePicker({
  open,
  onOpenChange,
  current,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: ThemeChoice;
  onApply: (choice: ThemeChoice) => Promise<void> | void;
}) {
  const [choice, setChoice] = useState<ThemeChoice>(current);
  const [saving, setSaving] = useState(false);

  // Each opening starts from the board's current theme.
  useEffect(() => {
    if (open) setChoice(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: Array<{ url: string }>) => {
      const url = res?.[0]?.url;
      if (url) setChoice((c) => ({ ...c, theme: "custom", themeImage: url }));
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const custom = customOf(choice);
  const opacityPct = Math.round((choice.themeOpacity ?? 1) * 100);
  const apply = async () => {
    setSaving(true);
    try {
      await onApply(choice);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto overscroll-contain sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Board theme</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 p-3 sm:grid-cols-[1fr_19rem]">
          <div className="space-y-3">
            <Preview choice={choice} />
            {choice.theme === "custom" && (
              <div className="flex flex-wrap items-center gap-3">
                <label className="border-border hover:bg-muted inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
                  <ImagePlus className="size-4" />
                  {isUploading
                    ? "Uploading…"
                    : choice.themeImage
                      ? "Change background"
                      : "Upload background"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void startUpload([file]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="color"
                    value={choice.themeColor ?? "#6d5dfc"}
                    onChange={(e) =>
                      setChoice((c) => ({ ...c, themeColor: e.target.value }))
                    }
                    className="border-border size-9 cursor-pointer rounded-md border bg-transparent p-1"
                    aria-label="Your note colour"
                  />
                  Your note colour
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  Opacity
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={opacityPct}
                    onChange={(e) =>
                      setChoice((c) => ({
                        ...c,
                        themeOpacity: Number(e.target.value) / 100,
                      }))
                    }
                    className="accent-primary w-28"
                    aria-label="Note opacity"
                  />
                  <span className="text-muted-foreground w-9 text-xs tabular-nums">
                    {opacityPct}%
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <Switch
                    checked={choice.themeBlur ?? false}
                    onCheckedChange={(on) =>
                      setChoice((c) => ({ ...c, themeBlur: on }))
                    }
                    aria-label="Blur the background behind notes"
                  />
                  Blur behind notes
                </label>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 content-start gap-x-2 gap-y-3 p-1">
            {BOARD_THEME_IDS.map((id) => (
              <Tile
                key={id}
                id={id}
                selected={choice.theme === id}
                custom={custom}
                onSelect={() => setChoice((c) => ({ ...c, theme: id }))}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-3 pt-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void apply()}
            isLoading={saving}
            disabled={isUploading}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
