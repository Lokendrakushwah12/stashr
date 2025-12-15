"use client";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import UserMenu from "../auth/user-menu";
import { Button } from "../ui/button";
import { StashrLogo } from "../ui/icons";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="bg-background/90 sticky inset-x-0 top-0 z-50 transform backdrop-blur-lg">
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between border-b px-5 transition-all duration-400",
          isScrolled ? "border-dashed py-2.5" : "border-transparent py-6",
        )}
      >
        <Link
          href={session ? "/board" : "/"}
          className="text-foreground flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <StashrLogo width={24} className="text-primary" />
          <span className="text-base font-medium">Stashr</span>
        </Link>
        <div className="flex items-center justify-center space-x-2">
          {/* Use cases */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="#use-cases" className="text-muted-foreground">
              Use Cases
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#features" className="text-muted-foreground">
              Features
            </Link>
          </Button>
          {status === "loading" ? (
            <div className="bg-secondary h-8 w-8 animate-pulse rounded-full"></div>
          ) : session ? (
            <UserMenu />
          ) : (
            <Button size="sm" asChild>
              <Link href="/auth/signin">Try Stashr</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
