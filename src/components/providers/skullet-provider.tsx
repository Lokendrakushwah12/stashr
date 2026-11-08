"use client";

import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { SkulletProvider } from "skullet/react";

const theme = {
  light: { base: "rgb(0 0 0 / 0.06)", highlight: "rgb(255 255 255 / 0.6)" },
  dark: {
    base: "rgb(255 255 255 / 0.07)",
    highlight: "rgb(255 255 255 / 0.08)",
  },
  animation: "shimmer",
  speed: "slow",
  radius: "6px",
} as const;

/** Skeletons for every loading state, following the app's light/dark theme. */
export function AppSkulletProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <SkulletProvider
      theme={theme}
      mode={resolvedTheme === "dark" ? "dark" : "light"}
    >
      {children}
    </SkulletProvider>
  );
}
