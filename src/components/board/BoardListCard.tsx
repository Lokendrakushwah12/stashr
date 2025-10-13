"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Board } from "@/types";
import { Users, SparkleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface BoardCardProps {
  board: Board;
  onUpdate: () => void;
  collaboratorCount?: number;
}

const BoardCard = ({ board, collaboratorCount = 0 }: BoardCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/board/${board._id}`);
  };

  return (
    <>
      <Card
        className="group relative bg-accent/20 dark:bg-accent h-32 cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 ease-out"
        onClick={handleCardClick}
      >
        <div className="z-1 absolute left-1/2 -translate-x-1/2 translate-y-1/4 -bottom-1 h-[60%] w-[80%] overflow-hidden rounded-xl border bg-white/60 p-2 backdrop-blur-2xl transition-all duration-200 ease-out group-hover:rotate-2 dark:border-white/10 dark:bg-white/10">
          <div className="mb-2 h-[40%] w-[50%] rounded-md bg-black/5 dark:bg-white/10" />
          <div className="h-[40%] w-full rounded-md bg-black/5 dark:bg-white/10" />
        </div>
        <div className="z-0 absolute left-1/2 -translate-x-1/2 -translate-y-[10%] scale-90 -bottom-1 h-[60%] w-[80%] overflow-hidden rounded-xl border bg-white/60 p-2 backdrop-blur-2xl transition-all duration-200 ease-out group-hover:-rotate-2 dark:border-white/10 dark:bg-white/10">
          <div className="mb-2 h-[40%] w-[50%] rounded-md bg-black/5 dark:bg-white/10" />
          <div className="h-[40%] w-full rounded-md bg-black/5 dark:bg-white/10" />
        </div>
        <CardHeader className="gap-0 space-y-0 px-4 py-2">
          <CardTitle className="flex items-center justify-between gap-2 text-lg">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="font-display truncate text-xl">
                {board.name}
              </span>
              {collaboratorCount > 0 && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  <span>{collaboratorCount}</span>
                </div>
              )}
            </div>
          </CardTitle>
          {board.description && (
            <p className="text-muted-foreground z-20 line-clamp-2 text-sm text-shadow-xs">
              {board.description}
            </p>
          )}
        </CardHeader>
      </Card>
    </>
  );
};

export default BoardCard;
