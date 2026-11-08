// Board appearance: a shared icon and theme, set per board like a chat theme
// in Instagram (everyone on the board sees it, not per viewer). A theme is a
// wallpaper plus two note colours: yours ("mine") and teammates' ("theirs").
// Wallpapers are drawn in CSS/SVG here, so they're original and weightless.

type Scheme = "light" | "dark";

export type BoardThemeSpec = {
  label: string;
  scheme: Scheme;
  /** CSS `background` for the whole content panel. */
  wallpaper: string;
  mine: { bg: string; fg: string };
  theirs: { bg: string; fg: string };
  accent: { bg: string; fg: string };
  /** Frost the wallpaper behind notes (custom themes). */
  blur?: boolean;
};

const svg = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'>${body}</svg>`,
  )}")`;

const STARS = svg(
  [
    [12, 20, 1.1, 0.9],
    [48, 64, 0.8, 0.6],
    [90, 18, 1.3, 0.8],
    [130, 52, 0.7, 0.5],
    [160, 110, 1, 0.7],
    [24, 130, 0.9, 0.6],
    [70, 150, 1.2, 0.9],
    [110, 96, 0.6, 0.5],
    [178, 24, 0.8, 0.6],
    [140, 170, 1, 0.7],
    [6, 84, 0.7, 0.5],
    [190, 80, 1.1, 0.8],
  ]
    .map(
      ([x, y, r, o]) =>
        `<circle cx='${x}' cy='${y}' r='${r}' fill='white' fill-opacity='${o}'/>`,
    )
    .join(""),
  200,
  200,
);

const WAVES = svg(
  "<path d='M0 60 C 150 20 300 100 450 60 S 750 20 900 60 V 300 H 0 Z' fill='%2338bdf8' fill-opacity='0.35'/>" +
    "<path d='M0 120 C 200 70 350 160 550 110 S 800 80 900 120 V 300 H 0 Z' fill='%230ea5e9' fill-opacity='0.4'/>" +
    "<path d='M0 190 C 180 150 380 230 580 180 S 820 160 900 200 V 300 H 0 Z' fill='%230369a1' fill-opacity='0.55'/>",
  900,
  300,
);

const HILLS = svg(
  "<path d='M0 140 C 200 40 420 60 600 130 S 820 90 900 110 V 300 H 0 Z' fill='%23a7d9a5'/>" +
    "<path d='M0 200 C 220 120 420 170 640 190 S 840 150 900 170 V 300 H 0 Z' fill='%2374bf7a'/>" +
    "<path d='M0 250 C 260 210 520 270 900 230 V 300 H 0 Z' fill='%234f9d5c'/>",
  900,
  300,
);

export const BOARD_THEMES = {
  default: {
    label: "Default",
    scheme: "light",
    wallpaper: "",
    mine: { bg: "", fg: "" },
    theirs: { bg: "", fg: "" },
    accent: { bg: "", fg: "" },
  },
  "night-garden": {
    label: "Night Garden",
    scheme: "dark",
    wallpaper: `radial-gradient(55% 35% at 85% 78%, rgb(255 182 197 / 0.32), transparent 70%), radial-gradient(40% 28% at 12% 58%, rgb(255 196 206 / 0.24), transparent 70%), ${STARS} 0 0 / 200px 200px, linear-gradient(180deg, #090e22 0%, #1a1540 100%)`,
    mine: { bg: "#ffd9e0", fg: "#2b1420" },
    theirs: { bg: "#3c2a60", fg: "#ffffff" },
    accent: { bg: "#ff9fb4", fg: "#2b1420" },
  },
  waves: {
    label: "Waves",
    scheme: "dark",
    wallpaper: `${WAVES} bottom / 100% 55% no-repeat, linear-gradient(180deg, #1e40af 0%, #0b2a6b 100%)`,
    mine: { bg: "#22c3e6", fg: "#03263a" },
    theirs: { bg: "#10306f", fg: "#ffffff" },
    accent: { bg: "#38d3f2", fg: "#03263a" },
  },
  meadow: {
    label: "Meadow",
    scheme: "light",
    wallpaper: `${HILLS} bottom / 100% 45% no-repeat, linear-gradient(180deg, #d9f0ff 0%, #fdf8e6 70%)`,
    mine: { bg: "#fff1b8", fg: "#3a2c00" },
    theirs: { bg: "#ffffff", fg: "#1e3a24" },
    accent: { bg: "#3c9a52", fg: "#ffffff" },
  },
  dusk: {
    label: "Dusk",
    scheme: "dark",
    wallpaper:
      "radial-gradient(18% 14% at 72% 26%, rgb(255 236 200 / 0.9), rgb(255 200 150 / 0.4) 60%, transparent 100%), linear-gradient(180deg, #ffad86 0%, #f4728f 45%, #6d43c9 100%)",
    mine: { bg: "#fff0e6", fg: "#5a1d2c" },
    theirs: { bg: "#47205e", fg: "#ffffff" },
    accent: { bg: "#ffe0c2", fg: "#5a1d2c" },
  },
  aurora: {
    label: "Aurora",
    scheme: "dark",
    wallpaper:
      "radial-gradient(45% 35% at 20% 25%, rgb(52 211 153 / 0.35), transparent 70%), radial-gradient(40% 40% at 80% 35%, rgb(139 92 246 / 0.4), transparent 70%), radial-gradient(50% 35% at 50% 90%, rgb(56 189 248 / 0.25), transparent 70%), #05070f",
    mine: { bg: "#7af0c8", fg: "#032a1e" },
    theirs: { bg: "#1b2338", fg: "#e6f0ff" },
    accent: { bg: "#5eead4", fg: "#032a1e" },
  },
  library: {
    label: "Library",
    scheme: "dark",
    wallpaper:
      "repeating-linear-gradient(135deg, rgb(255 240 160 / 0.035) 0 12px, transparent 12px 24px), repeating-linear-gradient(45deg, rgb(255 240 160 / 0.035) 0 12px, transparent 12px 24px), radial-gradient(120% 90% at 50% 40%, #5c561f 0%, #2a260b 70%, #17150a 100%)",
    mine: { bg: "#cdc27a", fg: "#2a2608" },
    theirs: { bg: "#3b3719", fg: "#f3efd2" },
    accent: { bg: "#ddd28a", fg: "#2a2608" },
  },
  blueprint: {
    label: "Blueprint",
    scheme: "dark",
    wallpaper:
      "linear-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px) 0 0 / 96px 96px, linear-gradient(90deg, rgb(255 255 255 / 0.12) 1px, transparent 1px) 0 0 / 96px 96px, linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px) 0 0 / 24px 24px, #0f3b8c",
    mine: { bg: "#ffffff", fg: "#0f3b8c" },
    theirs: { bg: "#1b4fae", fg: "#ffffff" },
    accent: { bg: "#ffffff", fg: "#0f3b8c" },
  },
  candy: {
    label: "Candy",
    scheme: "light",
    wallpaper:
      "radial-gradient(circle at 12px 12px, #ffc2d9 4px, transparent 5px) 0 0 / 28px 28px, linear-gradient(180deg, #ffe6f0 0%, #ffd6e7 100%)",
    mine: { bg: "#ff6fa8", fg: "#ffffff" },
    theirs: { bg: "#ffffff", fg: "#5a1835" },
    accent: { bg: "#ff4f93", fg: "#ffffff" },
  },
  custom: {
    label: "Custom",
    scheme: "dark",
    wallpaper: "",
    mine: { bg: "", fg: "" },
    theirs: { bg: "rgb(20 20 26 / 0.82)", fg: "#ffffff" },
    accent: { bg: "", fg: "" },
  },
} satisfies Record<string, BoardThemeSpec>;

export type BoardThemeId = keyof typeof BOARD_THEMES;

export const BOARD_THEME_IDS = Object.keys(BOARD_THEMES) as BoardThemeId[];

export function isBoardThemeId(value: unknown): value is BoardThemeId {
  return typeof value === "string" && value in BOARD_THEMES;
}

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** A board's theme, resolved (custom = uploaded image + chosen note colour). */
export type CustomThemeInput = {
  image?: string;
  color?: string;
  /** Note opacity, 0.2–1. */
  opacity?: number;
  blur?: boolean;
};

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alpha})`;
}

/** A board's theme, resolved (custom = uploaded image + chosen note style). */
export function resolveTheme(
  id: string | null | undefined,
  custom?: CustomThemeInput,
): BoardThemeSpec | null {
  if (!id || !isBoardThemeId(id) || id === "default") return null;
  const spec: BoardThemeSpec = BOARD_THEMES[id];
  if (id !== "custom") return spec;
  const color =
    custom?.color && HEX_RE.test(custom.color) ? custom.color : "#6d5dfc";
  const opacity = Math.min(1, Math.max(0.2, custom?.opacity ?? 1));
  const onColor = readableForeground(color);
  return {
    ...spec,
    // A scrim keeps notes and text readable over any photo.
    wallpaper: custom?.image
      ? `linear-gradient(rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.45)), url("${custom.image}") center / cover no-repeat`
      : `linear-gradient(160deg, ${color}, #111118 85%)`,
    mine: { bg: withAlpha(color, opacity), fg: onColor },
    theirs: {
      bg: `rgb(20 20 26 / ${(0.82 * opacity).toFixed(2)})`,
      fg: "#ffffff",
    },
    accent: { bg: color, fg: onColor },
    blur: custom?.blur ?? false,
  };
}

/** Panel-wide CSS: wallpaper, the scheme's tokens and the note colours. */
export function themePanelStyle(spec: BoardThemeSpec): React.CSSProperties {
  const dark = spec.scheme === "dark";
  return {
    background: spec.wallpaper,
    backgroundAttachment: "local",
    colorScheme: spec.scheme,
    color: dark ? "#f5f5f7" : spec.theirs.fg,
    "--foreground": dark ? "#f5f5f7" : spec.theirs.fg,
    "--muted-foreground": dark
      ? "rgb(255 255 255 / 0.68)"
      : "rgb(0 0 0 / 0.55)",
    "--border": dark ? "rgb(255 255 255 / 0.16)" : "rgb(0 0 0 / 0.1)",
    "--input": dark ? "rgb(255 255 255 / 0.18)" : "rgb(0 0 0 / 0.12)",
    "--background": dark ? "rgb(10 10 18 / 0.45)" : "rgb(255 255 255 / 0.7)",
    "--card": dark ? "rgb(10 10 18 / 0.55)" : "rgb(255 255 255 / 0.8)",
    "--card-foreground": dark ? "#f5f5f7" : spec.theirs.fg,
    "--muted": dark ? "rgb(255 255 255 / 0.08)" : "rgb(0 0 0 / 0.05)",
    "--accent": dark ? "rgb(255 255 255 / 0.1)" : "rgb(0 0 0 / 0.05)",
    "--secondary": dark ? "rgb(255 255 255 / 0.12)" : "rgb(0 0 0 / 0.06)",
    "--primary": spec.accent.bg,
    "--primary-foreground": spec.accent.fg,
    "--ring": spec.accent.bg,
    "--note-mine-bg": spec.mine.bg,
    "--note-mine-fg": spec.mine.fg,
    "--note-theirs-bg": spec.theirs.bg,
    "--note-theirs-fg": spec.theirs.fg,
    "--note-filter": spec.blur ? "blur(14px) saturate(140%)" : "none",
  } as React.CSSProperties;
}

// Topic-ish emoji for board icons; one tap, no picker library.
export const BOARD_EMOJI = [
  "💡",
  "📌",
  "🎯",
  "🚀",
  "🧠",
  "📚",
  "🎨",
  "🎬",
  "🎵",
  "📸",
  "✈️",
  "🏝️",
  "🍳",
  "🏃",
  "💼",
  "🛠️",
  "🧪",
  "📈",
  "💸",
  "🛒",
  "🏠",
  "🌱",
  "🐾",
  "🎮",
  "❤️",
  "⭐",
  "🔥",
  "🌙",
  "☕",
  "🎁",
  "🗓️",
  "📝",
];

/**
 * Text color that reads on `hex`, using WCAG relative luminance. Tuned so
 * light pastels get dark text and saturated mid-tones get white.
 */
export function readableForeground(hex: string): string {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "oklch(1 0 0)";
  const channel = (i: number) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return L > 0.5 ? "oklch(0.15 0 0)" : "oklch(1 0 0)";
}
