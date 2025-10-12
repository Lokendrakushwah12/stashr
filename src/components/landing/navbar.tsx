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
    <header
      className={cn(
        "bg-background/90 sticky inset-x-0 top-0 z-[50] h-16 transform border-b border-dashed backdrop-blur-lg",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[86rem] items-center justify-between px-5">
        <Link
          href={session ? "/board" : "/"}
          className="text-foreground flex items-center gap-2 text-lg font-semibold"
        >
          <Logo width={28} />
          <span className="text-base font-medium">Stashr</span>
        </Link>
        <div className="flex items-center justify-center space-x-2">
          {status === "loading" ? (
            <div className="bg-secondary h-8 w-8 animate-pulse rounded-full"></div>
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
  );
};

export default Navbar;
