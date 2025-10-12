"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Board } from '@/types';
import { Users, SparkleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
                className="group relative rounded-2xl rounded-br-none ease-out h-32 overflow-hidden transition-all duration-200 cursor-pointer"
                style={{ background: `${board.color}3A`, borderColor: `${board.color}2A` }}
                onClick={handleCardClick}
            >
                <div className="border group-hover:rotate-3 rounded-br-xl overflow-hidden ease-out transition-all dark:border-white/10 w-full translate-x-1/4 h-[60%] scale-90 bg-white/40 dark:bg-white/10 z0 p-2 rounded-tl-2xl absolute bottom-3.5 -right-4" />
                <div className="border group-hover:rotate-1 rounded-br-xl overflow-hidden ease-out transition-all dark:border-white/10 w-full translate-x-1/4 h-[60%] scale-95 bg-white/50 dark:bg-white/10 z10 backdrop-blur-2xl p-2 rounded-tl-2xl absolute bottom-1.5 -right-2" />
                <div className="border group-hover:-rotate-2 rounded-br-xl overflow-hidden ease-out transition-all duration-200 dark:border-white/10 w-full translate-x-1/4 h-[60%] bg-white/60 dark:bg-white/10 z20 p-2 backdrop-blur-2xl rounded-tl-2xl absolute -bottom-1 -right-1" >
                    <div className="w-[50%] h-[50%] bg-black/5 dark:bg-white/10 rounded-lg mb-2" />
                    <div className="w-full h-[50%] bg-black/5 dark:bg-white/10 rounded-lg" />
                </div>
                <CardHeader className="px-4 py-2 gap-0 space-y-0">
                    <CardTitle className="flex items-center justify-between gap-2 text-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="truncate text-xl font-display">{board.name}</span>
                            {collaboratorCount > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{collaboratorCount}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-base font-mono font-normal flex-shrink-0"
                            style={{ color: board.color }}
                        >
                            {board.cardCount ?? 0}
                        </span>
                    </CardTitle>
                    {board.description && (
                        <p className="text-sm text-muted-foreground z-20 text-shadow-xs line-clamp-2">{board.description}</p>
                    )}
                </CardHeader>
            </Card>
        </>
    );
};

export default BoardCard;
