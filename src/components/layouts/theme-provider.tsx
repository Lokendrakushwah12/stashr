"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }} />;
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
};
