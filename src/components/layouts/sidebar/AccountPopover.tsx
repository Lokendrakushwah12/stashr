"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAdminStatus } from "@/lib/hooks/use-admin";
import { cn } from "@/lib/utils";
import { GearIcon, Shield, SignOutIcon } from "@phosphor-icons/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "../theme-toggle";
import {
  Logout2,
  Settings,
  ShieldUser,
} from "@solar-icons/react-perf/category/style/BoldDuotone";

interface AccountPopoverProps {
  className?: string;
}

export default function AccountPopover({
  className = "",
}: AccountPopoverProps) {
  const { data: session } = useSession();
  const { isAdmin } = useAdminStatus();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/auth/signin" });
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleProfile = () => {
    router.push("/profile");
    setOpen(false);
  };

  if (!session?.user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "hover:bg-muted/70 bg-muted/40 h-auto w-full justify-start gap-3 p-2",
            className,
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="bg-primary/10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
              <Avatar className="size-5 rounded-md sm:size-8">
                <AvatarImage
                  src={session.user.image ?? ""}
                  alt={session.user.name ?? ""}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0) ??
                    session.user.email?.charAt(0) ??
                    "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-medium">
                {session.user.name ?? session.user.email}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {session.user.email}
              </div>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div>
          {/* User Info */}
          <div className="flex items-center justify-start gap-0 px-3">
            <Avatar className="size-5 rounded-md sm:size-8">
              <AvatarImage
                src={session.user.image ?? ""}
                alt={session.user.name ?? ""}
              />
              <AvatarFallback>
                {session.user.name?.charAt(0) ??
                  session.user.email?.charAt(0) ??
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="p-2">
              <div className="text-sm font-medium">
                {session.user.name ?? "User"}
              </div>
              <div className="text-muted-foreground text-xs">
                {session.user.email}
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2"
            onClick={handleProfile}
          >
            <Settings className="text-muted-foreground h-4 w-4" />
            Profile Settings
          </Button>

          {/* Theme Selection */}
          <ThemeToggle className="w-full" title="Toggle theme" />

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => router.push("/admin")}
            >
              <ShieldUser className="text-muted-foreground h-4 w-4" />
              Admin
            </Button>
          )}

          {/* Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <Logout2 className="text-muted-foreground h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
