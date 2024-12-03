"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "../layouts/theme-toggle";
import X from "../ui/x";

const Navbar = () => {
  return (
    <div className="relative h-full w-full">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] h-16 transform border-b bg-background/90 backdrop-blur-lg",
        )}
      >
        <div className="container flex h-16 w-full items-center justify-center">
          <div className="sticky inset-x-0 flex w-full items-center justify-between">
            <div className="flex items-center gap-6 lg:flex-none">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold text-foreground"
              >
                <X />
                <span className="text-base font-medium">Twitter Receipt</span>
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
