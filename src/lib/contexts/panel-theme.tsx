"use client";

import {
  resolveTheme,
  themePanelStyle,
  type BoardThemeSpec,
} from "@/lib/board-themes";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// The board being viewed themes the whole content panel (everything right of
// the sidebar), like a chat theme in Instagram.
type PanelTheme = {
  id: string;
  image?: string;
  color?: string;
  opacity?: number;
  blur?: boolean;
} | null;

const PanelThemeContext = createContext<{
  theme: PanelTheme;
  setTheme: (theme: PanelTheme) => void;
}>({ theme: null, setTheme: () => undefined });

export function PanelThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<PanelTheme>(null);
  return (
    <PanelThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </PanelThemeContext.Provider>
  );
}

/** The resolved theme, its id and panel style for the panel element. */
export function usePanelTheme(): {
  id: string;
  spec: BoardThemeSpec;
  style: React.CSSProperties;
} | null {
  const { theme } = useContext(PanelThemeContext);
  return useMemo(() => {
    const spec = resolveTheme(theme?.id, theme ?? undefined);
    return spec && theme
      ? { id: theme.id, spec, style: themePanelStyle(spec) }
      : null;
  }, [theme]);
}

/** Applies a board's theme to the panel while the calling page is mounted. */
export function useBoardPanelTheme(
  board:
    | {
        theme?: string;
        themeImage?: string;
        themeColor?: string;
        themeOpacity?: number;
        themeBlur?: boolean;
      }
    | undefined,
) {
  const { setTheme } = useContext(PanelThemeContext);
  const id = board?.theme;
  const image = board?.themeImage;
  const color = board?.themeColor;
  const opacity = board?.themeOpacity;
  const blur = board?.themeBlur;
  useEffect(() => {
    setTheme(
      id && id !== "default" ? { id, image, color, opacity, blur } : null,
    );
    return () => setTheme(null);
  }, [id, image, color, opacity, blur, setTheme]);
}
