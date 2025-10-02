"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAdminStatus } from "@/lib/hooks/use-admin";
import { cn } from "@/lib/utils";
import {
  GearIcon,
  Shield,
  SignOutIcon
} from "@phosphor-icons/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "../theme-toggle";

interface AccountPopoverProps {
  className?: string;
}

export default function AccountPopover({ className = "" }: AccountPopoverProps) {
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
            "w-full justify-start gap-3 p-2 h-auto hover:bg-muted/70 bg-muted/40",
            className
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Avatar className="size-5 rounded-md sm:size-8">
            <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
            <AvatarFallback>
              {session.user.name?.charAt(0) ?? session.user.email?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium truncate">
                {session.user.name ?? session.user.email}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </div>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div>
          {/* User Info */}
          <div className="flex justify-start items-center gap-0 px-3">
          <Avatar className="size-5 rounded-md sm:size-8">
            <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
            <AvatarFallback>
              {session.user.name?.charAt(0) ?? session.user.email?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="p-2">
            <div className="text-sm font-medium">{session.user.name ?? "User"}</div>
            <div className="text-xs text-muted-foreground">{session.user.email}</div>
          </div>
          </div>
          
          <Separator />
          
          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 mt-2"
            onClick={handleProfile}
          >
            <GearIcon className="h-4 w-4" />
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
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          )}

          {/* Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <SignOutIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
