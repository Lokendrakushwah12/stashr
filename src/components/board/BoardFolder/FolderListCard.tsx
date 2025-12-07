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
        className="group relative w-full cursor-pointer perspective-midrange"
        onClick={handleCardClick}
      >
        <div className="relative flex h-8 flex-row items-start justify-start">
          <h4 className="font-display bg-border text-foreground -z-9 h-full w-fit max-w-48 min-w-12 truncate rounded-tl-md pl-2 text-xl font-semibold tracking-tight text-nowrap select-none">
            {board.name}
          </h4>
          <FolderClip className="text-border -z-10" />
          <div className="bg-border absolute top-full left-0 -z-10 h-4 w-full rounded-tr-lg" />
        </div>
        <div className="relative h-[135px] w-full origin-bottom transition-transform duration-300 group-hover:transform-[rotateX(-24deg)] sm:w-[250px]">
          <div className="bg-sidebar-ring absolute inset-0 h-[135px] w-full overflow-hidden rounded-lg shadow-md sm:w-[250px]"></div>
        </div>
        {/* Images that pop out */}
        <div className="absolute inset-0 left-1/4 -z-5 opacity-0 transition-opacity delay-75 duration-300 group-hover:opacity-100">
          <div className="light:bg-emerald-500 absolute top-4 -left-4 size-6 -rotate-24 rounded-md object-cover opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-40%] group-hover:translate-y-[-80%] group-hover:scale-120 group-hover:opacity-100 dark:bg-emerald-700" />
          <div className="light:bg-indigo-500 absolute top-2 left-1 size-6 rotate-12 rounded-md object-cover opacity-0 transition-all delay-75 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[70%] group-hover:translate-y-[-10%] group-hover:scale-110 group-hover:opacity-100 dark:bg-indigo-700" />
          <div className="light:bg-green-400 absolute top-2 left-1/2 size-6 -translate-x-1/2 rotate-12 rounded-md object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-120%] group-hover:translate-y-[-60%] group-hover:scale-110 group-hover:opacity-100 dark:bg-green-700" />
          <div className="light:bg-sky-400 absolute top-0 right-1/4 size-6 -translate-x-1/2 -rotate-8 rounded-md object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-50%] group-hover:translate-y-[-90%] group-hover:scale-110 group-hover:opacity-100 dark:bg-sky-700" />
          <div className="light:bg-amber-400 absolute top-4 right-5 -z-4 size-6 -translate-x-1/2 rotate-16 rounded-md object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[20%] group-hover:translate-y-[-60%] group-hover:scale-110 group-hover:opacity-100 dark:bg-amber-700" />
        </div>
      </div>
    </div>
  );
}
