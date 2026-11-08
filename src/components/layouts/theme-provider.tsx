"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

// No mount gate: next-themes sets the theme class before paint with its own
// inline script (the root <html> has suppressHydrationWarning for it), so
// pages can render on the server instead of starting as a blank div.
export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem={true}
    disableTransitionOnChange
  >
    {children}
  </NextThemeProvider>
);
