"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Folder } from "@/types";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface FolderCardProps {
  folder: Folder;
  onUpdate: () => void;
  collaboratorCount?: number;
}

const FolderCard = ({ folder, collaboratorCount = 0 }: FolderCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/bookmarks/${folder._id}`);
  };

  return (
    <>
      <Card
        className="group relative h-32 cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 ease-out"
        style={{
          background: `${folder.color}2A`,
          borderColor: `${folder.color}0A`,
        }}
        onClick={handleCardClick}
      >
        <div className="absolute -bottom-1 left-1/2 z-1 h-[60%] w-[80%] -translate-x-1/2 translate-y-1/4 overflow-hidden rounded-xl border bg-white/60 p-2 backdrop-blur-2xl transition-all duration-200 ease-out group-hover:-rotate-2 dark:border-white/10 dark:bg-white/10">
          <div className="mb-2 h-[40%] w-[50%] rounded-md bg-black/5 dark:bg-white/10" />
          <div className="h-[40%] w-full rounded-md bg-black/5 dark:bg-white/10" />
        </div>
        <div className="absolute -bottom-1 left-1/2 z-0 h-[60%] w-[80%] -translate-x-1/2 -translate-y-[10%] scale-90 overflow-hidden rounded-xl border bg-white/60 p-2 backdrop-blur-2xl transition-all duration-200 ease-out group-hover:-rotate-2 dark:border-white/10 dark:bg-white/10">
          <div className="mb-2 h-[40%] w-[50%] rounded-md bg-black/5 dark:bg-white/10" />
          <div className="h-[40%] w-full rounded-md bg-black/5 dark:bg-white/10" />
        </div>
        <div className="absolute -bottom-1 left-1/2 z-0 h-[60%] w-[80%] -translate-x-1/2 translate-y-[5%] scale-95 overflow-hidden rounded-xl border bg-white/60 p-2 backdrop-blur-2xl transition-all duration-200 ease-out group-hover:rotate-2 dark:border-white/10 dark:bg-white/10">
          <div className="mb-2 h-[40%] w-[50%] rounded-md bg-black/5 dark:bg-white/10" />
          <div className="h-[40%] w-full rounded-md bg-black/5 dark:bg-white/10" />
        </div>
        <CardHeader className="gap-0 space-y-0 px-4 py-2">
          <CardTitle className="flex items-center justify-between gap-2 text-lg">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="font-display truncate text-xl">
                {folder.name}
              </span>
              {collaboratorCount > 0 && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  <span>{collaboratorCount}</span>
                </div>
              )}
            </div>
            <span
              className="flex-shrink-0 font-mono text-base font-normal"
              style={{ color: folder.color }}
            >
              {folder.bookmarkCount ?? 0}
            </span>
          </CardTitle>
          {folder.description && (
            <p className="text-muted-foreground z-20 line-clamp-2 text-sm text-shadow-xs">
              {folder.description}
            </p>
          )}
        </CardHeader>
      </Card>
    </>
  );
};

export default FolderCard;
