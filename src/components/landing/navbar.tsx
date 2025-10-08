"use client";

import Logo from "@/assets/svgs/assets/svgs/Logo";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserMenu from "../auth/user-menu";
import { Button } from "../ui/button";

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <>
      {/* Desktop/Tablet Top Navbar */}
      <header
        className={cn(
          "hidden sm:block sticky inset-x-0 top-0 z-[50] h-16 transform border-b border-dashed bg-background/90 backdrop-blur-lg",
        )}
      >
        <div className="max-w-[86rem] px-5 mx-auto flex h-16 w-full items-center justify-between">
          <Link
            href={session ? "/board" : "/"}
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Logo width={28} />
            <span className="text-base font-medium">Stashr</span>
          </Link>
          <div className="flex items-center justify-center space-x-2">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-secondary"></div>
            ) : session ? (
              <UserMenu />
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navbar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-[50] bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2 px-4">
          <Link
            href={session ? "/board" : "/"}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Logo width={20} />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {status === "loading" ? (
            <div className="flex flex-col items-center gap-1 px-3 py-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-secondary"></div>
              <span className="text-xs font-medium text-muted-foreground">Loading</span>
            </div>
          ) : session ? (
            <div className="flex flex-col items-center gap-1 px-3 py-2">
              <UserMenu />
              <span className="text-xs font-medium text-muted-foreground">Profile</span>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">S</span>
              </div>
              <span className="text-xs font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;