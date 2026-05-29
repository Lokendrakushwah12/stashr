"use client";

import { Card } from "@/components/ui/card";
import type { Bookmark } from "@/types";
import { motion } from "motion/react";
import { useState } from "react";
import BookmarkFavicon from "./BookmarkFavicon";

interface BookmarkInfiniteTileProps {
  bookmark: Bookmark;
  width?: number;
  height?: number;
}

// Iframe is rendered at a "page" size and scaled down. Tweak if needed.
const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 810;

export default function BookmarkInfiniteTile({
  bookmark,
  width = 320,
  height = 180,
}: BookmarkInfiniteTileProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showIframe = !bookmark.metaImage || imgFailed;

  const open = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-open]")) return;
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const scaleX = width / IFRAME_WIDTH;
  const scaleY = height / IFRAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
      }}
      className="pointer-events-auto"
      style={{ width, height }}
    >
      <Card
        onClick={open}
        className="group relative h-full w-full cursor-pointer overflow-hidden p-0 shadow-xs transition-shadow hover:shadow-md"
      >
        {showIframe ? (
          <div className="bg-muted absolute inset-0 overflow-hidden">
            <iframe
              src={bookmark.url}
              sandbox="allow-same-origin allow-scripts"
              referrerPolicy="no-referrer"
              loading="lazy"
              title={bookmark.title}
              className="origin-top-left border-0"
              style={{
                width: IFRAME_WIDTH,
                height: IFRAME_HEIGHT,
                transform: `scale(${scale})`,
                pointerEvents: "none",
              }}
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bookmark.metaImage}
            alt={bookmark.title}
            draggable={false}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3">
          <div className="flex items-center gap-2">
            <BookmarkFavicon
              url={bookmark.url}
              favicon={bookmark.favicon}
              draggable={false}
              className="size-4 shrink-0"
            />
            <p className="line-clamp-2 text-sm font-medium text-white">
              {bookmark.title}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
