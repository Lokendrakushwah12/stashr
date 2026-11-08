// Board appearance: a shared icon and theme, set per board like a chat theme
// in Instagram (everyone on the board sees it), not per viewer.

export const BOARD_THEMES = {
  default: { label: "Default", accent: null },
  ocean: { label: "Ocean", accent: "#2f7fd8" },
  grove: { label: "Grove", accent: "#3a9458" },
  sunset: { label: "Sunset", accent: "#e2603a" },
  plum: { label: "Plum", accent: "#9a4fd0" },
  graphite: { label: "Graphite", accent: "#55555e" },
} as const;

export type BoardThemeId = keyof typeof BOARD_THEMES;

export const BOARD_THEME_IDS = Object.keys(BOARD_THEMES) as BoardThemeId[];

export function isBoardThemeId(value: unknown): value is BoardThemeId {
  return typeof value === "string" && value in BOARD_THEMES;
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

/** CSS variables that recolor a subtree with the board's theme. */
export function boardThemeStyle(theme: string | undefined) {
  const accent = isBoardThemeId(theme) ? BOARD_THEMES[theme].accent : null;
  if (!accent) return undefined;
  return {
    "--primary": accent,
    "--ring": accent,
    "--primary-foreground": readableForeground(accent),
    "--selection": `color-mix(in srgb, ${accent} 20%, transparent)`,
  } as React.CSSProperties;
}
