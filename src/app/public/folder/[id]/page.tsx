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
        <div className="container py-8 space-y-8 mt-12 min-h-screen">
            {error && (
                <div className="max-w-md">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchFolder} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
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
                    <div className="flex items-center gap-4">
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
                        <div className="text-muted-foreground">No bookmarks</div>
                    )}
                </>
            )}
        </div>
    );
}


