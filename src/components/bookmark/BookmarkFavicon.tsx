"use client";

import { logoDevFallbackFor } from "@/lib/favicon";
import { cn } from "@/lib/utils";

interface BookmarkFaviconProps {
  url: string;
  favicon?: string | null;
  className?: string;
  alt?: string;
  draggable?: boolean;
}

export default function BookmarkFavicon({
  url,
  favicon,
  className,
  alt = "",
  draggable,
}: BookmarkFaviconProps) {
  const fallback = logoDevFallbackFor(url);
  const initial = favicon ?? fallback;
  if (!initial) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={initial}
      alt={alt}
      draggable={draggable}
      className={cn("rounded-sm", className)}
      onError={(e) => {
        const el = e.currentTarget;
        if (fallback && el.src !== fallback) {
          el.src = fallback;
        } else {
          el.style.display = "none";
        }
      }}
    />
  );
}
