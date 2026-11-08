// Board appearance: a shared icon and theme, set per board like a chat theme
// in Instagram (everyone on the board sees it), not per viewer.

// The palettes themselves live in globals.css (main[data-board-theme]);
// `swatch` previews one in the picker.
export const BOARD_THEMES = {
  default: { label: "Default", swatch: null },
  ocean: {
    label: "Ocean",
    swatch: "linear-gradient(135deg, #9cc8ff, #2f7fd8)",
  },
  grove: {
    label: "Grove",
    swatch: "linear-gradient(135deg, #a6dfb6, #2f8a50)",
  },
  sunset: {
    label: "Sunset",
    swatch: "linear-gradient(135deg, #ffc0a3, #e2603a 60%, #e0508c)",
  },
  plum: { label: "Plum", swatch: "linear-gradient(135deg, #d9bbff, #9a4fd0)" },
  graphite: {
    label: "Graphite",
    swatch: "linear-gradient(135deg, #d4d4d8, #3f3f46)",
  },
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
