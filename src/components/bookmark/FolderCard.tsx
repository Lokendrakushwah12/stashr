"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Folder } from '@/types';
import { useRouter } from 'next/navigation';

interface FolderCardProps {
    folder: Folder;
    onUpdate: () => void;
}

const FolderCard = ({ folder }: FolderCardProps) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/folder/${folder._id}`);
    };

    return (
        <>
            <Card
                className="group relative rounded-2xl h-32 overflow-hidden transition-all duration-200 cursor-pointer"
                style={{ background: `${folder.color}3A`, borderColor: `${folder.color}2A` }}
                onClick={handleCardClick}
            >
                <div className="border dark:border-white/10 w-[70%] h-[60%] bg-white/60 dark:bg-white/10 z-20 p-2 backdrop-blur-2xl rounded-tl-2xl absolute -bottom-1 -right-1" >
                    <div className="w-[50%] h-[50%] bg-black/5 dark:bg-white/10 rounded-lg mb-2" />
                    <div className="w-full h-[50%] bg-black/5 dark:bg-white/10 rounded-lg" />
                </div>
                <div className="border dark:border-white/10 w-[70%] h-[60%] scale-95 bg-white/50 dark:bg-white/10 z-10 backdrop-blur-2xl p-2 rounded-tl-2xl absolute bottom-1.5 -right-2" />
                <div className="border dark:border-white/10 w-[70%] h-[60%] scale-90 bg-white/40 dark:bg-white/10 z-0 p-2 rounded-tl-2xl absolute bottom-3.5 -right-4" />
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                        <span className="text-sm text-muted-foreground font-normal">
                            ({folder.bookmarks.length})
                        </span>
                    </CardTitle>
                    {folder.description && (
                        <p className="text-sm text-muted-foreground">{folder.description}</p>
                    )}
                </CardHeader>
            </Card>
        </>
    );
};

export default FolderCard; 