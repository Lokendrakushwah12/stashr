"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "../layouts/theme-toggle";
import { StashrLogo } from "../ui/icons";

const Navbar = () => {
  return (
    <div className="relative h-full w-full">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[50] h-16 transform border-b bg-background/90 backdrop-blur-lg",
        )}
      >
        <div className="container flex h-16 w-full items-center justify-center">
          <div className="sticky inset-x-0 flex w-full items-center justify-between">
            <div className="flex items-center gap-6 lg:flex-none">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold text-foreground"
              >
                <StashrLogo width={20} />
                <span className="text-sm font-medium">Stashr</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 py-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
