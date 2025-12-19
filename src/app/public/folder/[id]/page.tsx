"use client";

import BookmarkCard from "@/components/bookmark/BookmarkCard";
import { Button } from "@/components/ui/button";
import type { Bookmark } from "@/types";
import { Refresh } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { useParams } from "next/navigation";
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
    <div className="min-hscreen mx-auto h-[70vh] max-w-[86rem] space-y-8 px-5 py-8">
      {error && (
        <div className="max-w-md">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchFolder} variant="outline" size="sm">
            <Refresh className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {!error && !folder && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Refresh className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading folder...</p>
        </div>
      )}

      {folder && (
        <>
          <div className="flex items-center justify-center gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </h1>
              {folder.description && (
                <p className="text-muted-foreground mt-2">
                  {folder.description}
                </p>
              )}
            </div>
          </div>

          {folder.bookmarks?.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folder.bookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark._id}
                  bookmark={bookmark}
                  onEdit={() => undefined}
                  onDelete={() => undefined}
                  showDropdown={false}
                  isLoading={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="relative h-32 w-full sm:w-[25rem]">
                <div className="from-background absolute bottom-0 z-[99] h-16 w-full bg-gradient-to-t to-transparent" />
                <div className="dark:bg-muted/60 absolute bottom-0 z-20 h-[60%] w-full rounded-t-2xl border border-[#ddd] bg-white/60 p-2 backdrop-blur-2xl dark:border-white/10">
                  <div className="mb-2 h-[50%] w-[50%] rounded-lg bg-black/5 dark:bg-white/10" />
                  <div className="h-[50%] w-full rounded-lg bg-black/5 dark:bg-white/10" />
                </div>
                <div className="dark:bg-muted/50 absolute bottom-4 left-1/2 z-10 h-[60%] w-[95%] -translate-x-1/2 scale-95 rounded-t-2xl border border-[#ddd] bg-white/50 p-2 backdrop-blur-2xl transition-all group-hover:-rotate-2 dark:border-white/10" />
                <div className="dark:bg-muted/40 absolute bottom-8 left-1/2 z-0 h-[60%] w-[85%] -translate-x-1/2 scale-90 rounded-t-2xl border border-[#ddd] bg-white/40 p-2 transition-all group-hover:rotate-2 dark:border-white/10" />
              </div>
              <h3 className="mb-2 text-2xl font-medium">No bookmarks</h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}
