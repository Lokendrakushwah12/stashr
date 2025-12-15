"use client";
import type { Board } from "@/types";
import { useRouter } from "next/navigation";
import FolderClip from "./FolderClip";

interface BoardCardProps {
  board: Board;
  onUpdate: () => void;
  collaboratorCount?: number;
}

export default function FolderListCard({ board }: BoardCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/board/${board._id}`);
  };

  return (
    <div className="flex w-full items-center justify-center sm:w-fit">
      <div
        className="group relative w-full cursor-pointer transition-all duration-200 ease-out perspective-midrange active:scale-98"
        onClick={handleCardClick}
      >
        <div className="relative flex h-8 flex-row items-start justify-start">
          <h4 className="font-display bg-border text-foreground -z-9 h-full w-fit max-w-48 min-w-12 truncate rounded-tl-md pt-0.5 pl-2 text-xl font-semibold tracking-tight text-nowrap select-none">
            {board.name}
          </h4>
          <FolderClip className="text-border -z-10" />
          <div className="bg-border absolute top-full left-0 -z-10 h-4 w-full rounded-tr-lg" />
        </div>
        <div className="relative h-[135px] w-full origin-bottom transition-transform duration-300 group-hover:transform-[rotateX(-24deg)] sm:w-[250px]">
          <div className="bg-sidebar-ring/40 absolute inset-0 h-[135px] w-full overflow-hidden rounded-lg shadow-xs backdrop-blur-2xl sm:w-[250px]">
            <div className="h-1/4 bg-[repeating-linear-gradient(45deg,var(--primary-foreground)_0px,var(--primary-foreground)_2px,transparent_2px,transparent_5.5px)] opacity-40 dark:opacity-10" />
          </div>
        </div>
        {/* Images that pop out */}
        <div className="absolute inset-0 left-1/4 -z-5 opacity-0 transition-opacity delay-75 duration-300 group-hover:opacity-100">
          <div className="absolute top-2 left-1/2 size-6 -translate-x-1/2 rotate-12 rounded-md bg-yellow-200 object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-120%] group-hover:translate-y-[-60%] group-hover:scale-110 group-hover:opacity-100 dark:bg-yellow-900" />
          <div className="absolute top-0 right-[24%] size-6 -translate-x-1/2 -rotate-8 rounded-md bg-sky-200 object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-50%] group-hover:translate-y-[-90%] group-hover:scale-110 group-hover:opacity-100 dark:bg-sky-900" />
          <div className="absolute top-4 right-5 -z-4 size-6 -translate-x-1/2 rotate-16 rounded-md bg-rose-200 object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[20%] group-hover:translate-y-[-60%] group-hover:scale-110 group-hover:opacity-100 dark:bg-rose-900" />
        </div>
      </div>
    </div>
  );
}
