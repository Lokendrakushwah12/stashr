"use client";

import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";

interface TeamAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

const PALETTE = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

export function TeamAvatar({
  name,
  logoUrl,
  size = 24,
  className,
}: TeamAvatarProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-xs object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Avatar
      className="size-6 rounded-xs"
      name={name || "Team"}
      variant="marble"
      size={size}
      square
      colors={PALETTE}
    />
  );
}
