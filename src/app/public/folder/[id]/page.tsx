"use client";

import BookmarkCard from "@/components/bookmark/BookmarkCard";
import { Button } from "@/components/ui/button";
import type { Bookmark } from "@/types";
import { RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PublicFolder = {
    _id?: string;
    name: string;
    description?: string;
    color: string;
    bookmarks: Bookmark[];
};

export default function PublicFolderPage() {
    const params = useParams();
    const router = useRouter();
    const folderId = params.id as string;

    const [folder, setFolder] = useState<PublicFolder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFolder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/public/folders/${folderId}`);
            if (!res.ok) throw new Error(`status ${res.status}`);
            const raw = (await res.json()) as unknown;
            const data = raw as { folder: PublicFolder };
            setFolder(data.folder);
        } catch (e) {
            setError("Failed to fetch folder");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchFolder();
    }, [folderId]);

    return (
        <div className="max-w-[86rem] px-5 mx-auto py-8 space-y-8 min-hscreen h-[70vh]">
            {error && (
                <div className="max-w-md">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchFolder} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </Button>
                </div>
            )}

            {!error && !folder && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading folder...</p>
                </div>
            )}

            {folder && (
                <>
                    <div className="flex items-center justify-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: folder.color }}
                                />
                                {folder.name}
                            </h1>
                            {folder.description && (
                                <p className="text-muted-foreground mt-2">{folder.description}</p>
                            )}
                        </div>
                    </div>

                    {folder.bookmarks?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folder.bookmarks.map((bookmark) => (
                                <BookmarkCard
                                    key={bookmark._id}
                                    bookmark={bookmark}
                                    onEdit={() => undefined}
                                    onDelete={() => undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center">
                            <div className='relative h-32 w-full sm:w-[25rem]'>
                                <div className='absolute bottom-0 w-full h-16 bg-gradient-to-t from-background to-transparent z-[99]' />
                                <div className="border border-[#ddd] dark:border-white/10 w-full h-[60%] bg-white/60 dark:bg-muted/60 z-20 p-2 backdrop-blur-2xl rounded-t-2xl absolute bottom-0" >
                                    <div className="w-[50%] h-[50%] bg-black/5 dark:bg-white/10 rounded-lg mb-2" />
                                    <div className="w-full h-[50%] bg-black/5 dark:bg-white/10 rounded-lg" />
                                </div>
                                <div className="border border-[#ddd] group-hover:-rotate-2 transition-all dark:border-white/10 w-[95%] h-[60%] scale-95 bg-white/50 dark:bg-muted/50 z-10 backdrop-blur-2xl p-2 rounded-t-2xl absolute bottom-4 left-1/2 -translate-x-1/2" />
                                <div className="border border-[#ddd] group-hover:rotate-2 transition-all dark:border-white/10 w-[85%] h-[60%] scale-90 bg-white/40 dark:bg-muted/40 z-0 p-2 rounded-t-2xl absolute bottom-8 left-1/2 -translate-x-1/2" />
                            </div>
                            <h3 className="text-2xl font-medium mb-2">No bookmarks</h3>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}


