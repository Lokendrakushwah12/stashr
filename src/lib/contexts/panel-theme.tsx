"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// The board being viewed themes the whole content panel (everything right of
// the sidebar), like a chat theme in Instagram. Palettes live in globals.css
// under main[data-board-theme="…"].
const PanelThemeContext = createContext<{
  theme: string | null;
  setTheme: (theme: string | null) => void;
}>({ theme: null, setTheme: () => undefined });

export function PanelThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<string | null>(null);
  return (
    <PanelThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </PanelThemeContext.Provider>
  );
}

export function usePanelTheme() {
  return useContext(PanelThemeContext).theme;
}

/** Applies `theme` to the panel while the calling page is mounted. */
export function useBoardPanelTheme(theme: string | undefined | null) {
  const { setTheme } = useContext(PanelThemeContext);
  useEffect(() => {
    setTheme(theme && theme !== "default" ? theme : null);
    return () => setTheme(null);
  }, [theme, setTheme]);
}
