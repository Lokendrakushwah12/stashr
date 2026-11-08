"use client";

import type { ReactNode } from "react";
import { SkulletProvider } from "skullet/react";

// Colours live in globals.css, keyed on the `.dark` class next-themes sets
// before paint. Reading the theme here would differ between the server and
// the first client render and break hydration.
const theme = {
  animation: "shimmer",
  speed: "slow",
  radius: "6px",
} as const;

/** Skeletons for every loading state. */
export function AppSkulletProvider({ children }: { children: ReactNode }) {
  return <SkulletProvider theme={theme}>{children}</SkulletProvider>;
}
