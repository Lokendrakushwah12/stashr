"use client";
import { cn, getRelativeTime } from "@/lib/utils";
import type { Board } from "@/types";
import { Crown, Eye, PencilLineIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import FolderClip from "./FolderClip";

const ROLE_META: Record<
  NonNullable<Board["userRole"]>,
  { label: string; Icon: typeof Crown; className: string }
> = {
  owner: {
    label: "Owner",
    Icon: Crown,
    className: "text-amber-500 dark:text-amber-400",
  },
  editor: {
    label: "Editor",
    Icon: PencilLineIcon,
    className: "text-blue-500 dark:text-blue-400",
  },
  viewer: {
    label: "Viewer",
    Icon: Eye,
    className: "text-muted-foreground",
  },
};

interface BoardCardProps {
  board: Board;
  onUpdate: () => void;
  collaboratorCount?: number;
}

// Pastel pairs. Light = saturated ~200 shade. Dark = midway between the
// 800/900 Tailwind shades so it reads clearly on dark backgrounds without
// looking neon.
const PASTEL_PALETTE: Array<{ light: string; dark: string }> = [
  { light: "#fde68a", dark: "#85390e" }, // amber
  { light: "#bfdbfe", dark: "#1e3d9c" }, // blue
  { light: "#fbcfe8", dark: "#901748" }, // pink
  { light: "#bbf7d0", dark: "#155c30" }, // green
  { light: "#c7d2fe", dark: "#342f92" }, // indigo
  { light: "#fecaca", dark: "#8c1c1c" }, // red
  { light: "#e9d5ff", dark: "#611e97" }, // purple
  { light: "#a5f3fc", dark: "#15566c" }, // cyan
  { light: "#fdba74", dark: "#8b3012" }, // orange
  { light: "#fef08a", dark: "#7b4610" }, // yellow
];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

// Deterministically pick 3 distinct pastel pairs from the board name.
function pickPastels(name: string): Array<{ light: string; dark: string }> {
  const len = PASTEL_PALETTE.length;
  const picked: number[] = [];
  let seed = hashString(name || "board");
  while (picked.length < 3) {
    const idx = seed % len;
    if (!picked.includes(idx)) picked.push(idx);
    seed = (seed * 1103515245 + 12345) >>> 0; // LCG step
  }
  return picked.map((i) => PASTEL_PALETTE[i]!);
}

export default function FolderListCard({ board }: BoardCardProps) {
  const router = useRouter();
  const [c1, c2, c3] = pickPastels(board.name);

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
        <div className="relative h-[135px] w-full origin-bottom transform-[rotateX(-15deg)] transition-transform duration-300 group-hover:transform-[rotateX(-28deg)] sm:w-[250px]">
          <div className="bg-sidebar-ring/40 absolute inset-0 h-[135px] w-full overflow-hidden rounded-lg shadow-xs backdrop-blur-2xl sm:w-[250px]">
            {board.userRole &&
              (() => {
                const meta = ROLE_META[board.userRole];
                return (
                  <span
                    className={cn(
                      "absolute bottom-1.5 left-1 z-10 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium select-none",
                      meta.className,
                    )}
                    title={meta.label}
                  >
                    <meta.Icon className="h-3 w-3" />
                    {meta.label}
                  </span>
                );
              })()}
            {board.updatedAt && (
              <span className="text-muted-foreground absolute inset-x-0 bottom-0 p-2 text-right font-mono text-xs leading-none tracking-tight select-none">
                Last edited {getRelativeTime(board.updatedAt)}
              </span>
            )}
            <div className="h-1/4 bg-[repeating-linear-gradient(45deg,var(--sidebar-primary-foreground)_0px,var(--primary-foreground)_2px,transparent_2px,transparent_5.5px)] opacity-40 dark:opacity-10" />
          </div>
        </div>
        {/* Images that pop out */}
        <div className="absolute inset-0 left-1/4 -z-5 opacity-0 transition-opacity delay-75 duration-300 group-hover:opacity-100">
          <div
            style={
              { "--pl": c1!.light, "--pd": c1!.dark } as React.CSSProperties
            }
            className="absolute top-2 left-1/2 size-6 -translate-x-1/2 rotate-12 rounded-md bg-(--pl) object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-120%] group-hover:translate-y-[-60%] group-hover:scale-110 group-hover:opacity-100 dark:bg-(--pd)"
          />
          <div
            style={
              { "--pl": c2!.light, "--pd": c2!.dark } as React.CSSProperties
            }
            className="absolute top-0 right-[24%] size-6 -translate-x-1/2 -rotate-8 rounded-md bg-(--pl) object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[-50%] group-hover:translate-y-[-90%] group-hover:scale-110 group-hover:opacity-100 dark:bg-(--pd)"
          />
          <div
            style={
              { "--pl": c3!.light, "--pd": c3!.dark } as React.CSSProperties
            }
            className="absolute top-4 right-5 -z-4 size-6 -translate-x-1/2 rotate-16 rounded-md bg-(--pl) object-cover opacity-0 transition-all delay-150 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[20%] group-hover:translate-y-[-60%] group-hover:scale-110 group-hover:opacity-100 dark:bg-(--pd)"
          />
        </div>
      </div>
    </div>
  );
}
