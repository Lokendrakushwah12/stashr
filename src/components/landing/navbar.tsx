"use client";

import { cn } from "@/lib/utils";
import { useAdminCheck } from "@/lib/hooks/use-admin";
import type { AdminCheckResponse } from "@/types";
import { Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserMenu from "../auth/user-menu";
import { ThemeToggle } from "../layouts/theme-toggle";
import { Button } from "../ui/button";
import { StashrLogo } from "../ui/icons";

const Navbar = () => {
  const { data: session, status } = useSession();
  const { data: adminCheck } = useAdminCheck();

  return (
    <div className="relative h-full w-full mx-auto">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[50] h-16 transform border-b bg-background/90 backdrop-blur-lg",
        )}
      >
        <div className="container flex h-16 w-full items-center justify-center">
          <div className="sticky inset-x-0 flex w-full items-center justify-between">
            <div className="flex items-center gap-6 lg:flex-none">
              <Link
                href={session ? "/folder" : "/"}
                className="flex items-center gap-2 text-lg font-semibold text-foreground"
              >
                <StashrLogo width={20} />
                <span className="text-sm font-medium">Stashr</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 py-4">
            {/* Admin Link - Only show for admin user */}
            {adminCheck?.isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
            <ThemeToggle />
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
    </div>
  );
};

export default Navbar;
