"use client";

import AddFolderDialog from "@/components/bookmark/AddFolderDialog";
import FolderCard from "@/components/bookmark/FolderCard";
import ImportExportDialog from "@/components/bookmark/ImportExportDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFolders } from "@/lib/hooks/use-bookmarks";
import type { Folder } from "@/types";
import {
  AddSquare,
  BookmarkSquare,
  FolderOpen,
  Library,
  Upload,
} from "@solar-icons/react-perf/BoldDuotone";
import { Magnifer, Sort } from "@solar-icons/react-perf/Outline";
import { Plus, X } from "lucide-react";
import { Skeleton } from "skullet/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SortKey = "recent" | "oldest" | "name";
const SORT_STORAGE_KEY = "bookmarksSortBy";

// Shapes the first skeleton (skullet remembers the real one after a visit).
const SAMPLE_FOLDERS: Folder[] = [
  "Inspiration",
  "Engineering blogs",
  "Recipes",
  "Read later",
  "Design systems",
  "Travel",
].map((name, i) => ({
  _id: `sample-${i}`,
  name,
  description: "A few saved links",
  bookmarkCount: 8,
}));

export default function AllBookmarksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [view, setView] = useState<"all" | "shared">("all");

  // Restore persisted sort on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (stored === "recent" || stored === "oldest" || stored === "name") {
      setSortBy(stored);
    }
  }, []);

  const handleSortChange = (value: string) => {
    if (value !== "recent" && value !== "oldest" && value !== "name") return;
    setSortBy(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SORT_STORAGE_KEY, value);
    }
  };

  // Use React Query for data fetching with search
  const {
    data: foldersResponse,
    isLoading,
    refetch: originalRefetch,
  } = useFolders(searchQuery || undefined);

  // Custom refetch with toast notification
  const handleRefetch = async () => {
    try {
      await originalRefetch();
      toast.success("Bookmarks refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh bookmarks");
    }
  };

  const allFolders = useMemo(
    () => foldersResponse?.data?.folders ?? [],
    [foldersResponse],
  );
  // `folders` = this team's; shared ones live only under the Shared tab.
  const folders = useMemo(
    () => allFolders.filter((f) => !f.shared),
    [allFolders],
  );
  const sharedFolders = useMemo(
    () => allFolders.filter((f) => f.shared),
    [allFolders],
  );

  const sortedFolders = useMemo(() => {
    const copy = [...(view === "shared" ? sharedFolders : folders)];
    copy.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "");
        case "oldest": {
          const aT = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
          const bT = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
          return aT - bT;
        }
        case "recent":
        default: {
          const aT = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
          const bT = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
          return bT - aT;
        }
      }
    });
    return copy;
  }, [view, folders, sharedFolders, sortBy]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <>
      <section className="min-h-screen space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">
              All Bookmarks
            </h1>
            <p className="text-muted-foreground">
              Manage your bookmark folders and collections
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Magnifer className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search bookmarks, folders, or URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background pr-9 pl-9"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => setShowImportExport(true)}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4" />
              Import/Export
            </Button>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger
                icon={<Sort className="h-4 w-4" />}
                className="w-full sm:w-[166px]"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddFolder(true)}>
              <AddSquare className="h-4 w-4" />
              Add Folder
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border">
            <div className="flex w-full flex-col items-start justify-center p-4">
              <Skeleton loading={isLoading} label="Loading folder count">
                <div className="font-mono text-3xl font-semibold">
                  {isLoading ? 12 : folders.length}
                </div>
              </Skeleton>
              <div className="text-muted-foreground text-sm">Total Folders</div>
            </div>
            <div className="bg-muted/30 bg-lines-diag flex h-full items-center justify-center px-9">
              <Library size={64} color="var(--color-muted-foreground)" />
            </div>
          </div>
          <div className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border">
            <div className="flex w-full flex-col items-start justify-center p-4">
              <Skeleton loading={isLoading} label="Loading bookmark count">
                <div className="font-mono text-3xl font-semibold">
                  {isLoading
                    ? 120
                    : folders.reduce(
                        (acc, folder) => acc + (folder.bookmarkCount ?? 0),
                        0,
                      )}
                </div>
              </Skeleton>
              <div className="text-muted-foreground text-sm">
                Total Bookmarks
              </div>
            </div>
            <div className="bg-muted/30 bg-lines-diag flex h-full items-center justify-center px-9">
              <BookmarkSquare size={64} color="var(--color-muted-foreground)" />
            </div>
          </div>
        </div>

        <Tabs
          defaultValue={view}
          onValueChange={(v) => setView(v === "shared" ? "shared" : "all")}
          variant="filled"
          className="w-fit"
        >
          <TabsList className="h-9 [&_div]:text-sm">
            {(
              [
                ["all", "All", folders.length],
                ["shared", "Shared", sharedFolders.length],
              ] as const
            ).map(([value, label, count]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex w-fit items-center justify-center gap-0 sm:flex-row"
              >
                <span>{label}</span>
                <Badge
                  variant="secondary"
                  className="bg-background/70 text-muted-foreground flex size-5 items-center justify-center text-xs"
                >
                  {count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Folders Grid: one element from skeleton to cards */}
        {isLoading || sortedFolders.length > 0 ? (
          <Skeleton
            data={isLoading ? null : sortedFolders}
            sample={SAMPLE_FOLDERS}
            id="folders-grid"
            label="Loading folders"
          >
            {(list) => (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {list.map((folder) => (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    onUpdate={() => handleRefetch()}
                  />
                ))}
              </div>
            )}
          </Skeleton>
        ) : view === "shared" && sharedFolders.length === 0 ? (
          <EmptyState
            icon={<FolderOpen />}
            title="Nothing shared with you yet"
            description="Folders people outside your teams invite you to will show up here."
          />
        ) : view === "all" && folders.length === 0 ? (
          <EmptyState
            icon={<FolderOpen />}
            title="No folders yet"
            description="Folders group bookmarks by topic. Create one, or import your browser bookmarks."
            action={
              <div className="flex gap-2">
                <Button onClick={() => setShowAddFolder(true)}>
                  <Plus className="h-4 w-4" />
                  Create a folder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImportExport(true)}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
            }
          />
        ) : null}
      </section>

      <AddFolderDialog
        open={showAddFolder}
        onOpenChange={setShowAddFolder}
        onSuccess={() => {
          setShowAddFolder(false);
          // React Query will automatically refetch after mutation
        }}
      />

      <ImportExportDialog
        open={showImportExport}
        onOpenChange={setShowImportExport}
      />
    </>
  );
}
