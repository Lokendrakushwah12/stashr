"use client";

import Logo from "@/assets/svgs/assets/svgs/Logo";
import { useAdminCheck } from "@/lib/hooks/use-admin";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserMenu from "../auth/user-menu";
import { ThemeToggle } from "../layouts/theme-toggle";
import { Button } from "../ui/button";

const Navbar = () => {
  const { data: session, status } = useSession();
  const { data: adminCheck } = useAdminCheck();

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-[50] h-16 transform border-b border-dashed bg-background/90 backdrop-blur-lg",
      )}
    >
      <div className="max-w-[86rem] px-5 mx-auto flex h-16 w-full items-center justify-between">
        <Link
          href={session ? "/folder" : "/"}
          className="flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          <Logo width={28} />
          <span className="text-base font-medium">Stashr</span>
        </Link>
        <div className="flex items-center justify-center space-x-2">
          <ThemeToggle />
          {adminCheck?.isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
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
  );
};

export default Navbar;