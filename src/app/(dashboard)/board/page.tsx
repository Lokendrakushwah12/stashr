"use client";

import AddBoardDialog from "@/components/board/AddBoardDialog";
import FolderListCard from "@/components/board/BoardFolder/FolderListCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBoards } from "@/lib/hooks/use-boards";
import { PlusIcon, SparkleIcon } from "@phosphor-icons/react";
import { Loader, Plus, RefreshCw, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function BoardsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Load sort preference from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem("boardsSortBy");
    if (savedSort) {
      setSortBy(savedSort);
    }
  }, []);

  // Save sort preference to localStorage
  const handleSortChange = (value: string) => {
    setSortBy(value);
    localStorage.setItem("boardsSortBy", value);
  };

  // Use React Query for data fetching with backend sorting and filtering
  const {
    data: boardsResponse,
    isLoading,
    refetch: originalRefetch,
  } = useBoards(sortBy, roleFilter);

  // Custom refetch with toast notification
  const handleRefetch = async () => {
    try {
      await originalRefetch();
      toast.success("Boards refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh boards");
    }
  };

  const boards = boardsResponse?.data?.boards ?? [];

  // Apply client-side search filter only
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;

    const query = searchQuery.toLowerCase();
    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(query) ||
        board.description?.toLowerCase().includes(query),
    );
  }, [boards, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Get all boards for role counts (unfiltered)
  const { data: allBoardsResponse } = useBoards(sortBy, "all");
  const allBoards = allBoardsResponse?.data?.boards ?? [];

  const roleCounts = useMemo(() => {
    return {
      all: allBoards.length,
      owner: allBoards.filter((b) => b.userRole === "owner").length,
      editor: allBoards.filter((b) => b.userRole === "editor").length,
      viewer: allBoards.filter((b) => b.userRole === "viewer").length,
    };
  }, [allBoards]);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <section className="min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">All Boards</h1>
            <p className="text-muted-foreground">
              Organize your ideas and concepts into boards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddBoard(true)}>
              <PlusIcon weight="duotone" className="h-4 w-4" />
              Add Board
            </Button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 pl-9"
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

          <Tabs
            defaultValue={roleFilter}
            onValueChange={setRoleFilter}
            variant="filled"
            className="w-fit"
          >
            <TabsList className="h-9 [&_div]:text-sm">
              <TabsTrigger
                value="all"
                className="flex w-fit flex-col items-center justify-center gap-0 sm:flex-row"
              >
                <span>All</span>
                <Badge
                  variant="secondary"
                  className="bg-background/70 text-muted-foreground flex size-5 items-center justify-center text-xs"
                >
                  {roleCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="owner"
                className="flex w-fit flex-col items-center justify-center gap-0 sm:flex-row"
              >
                <span>Owner</span>
                <Badge
                  variant="secondary"
                  className="bg-background/70 text-muted-foreground flex size-5 items-center justify-center text-xs"
                >
                  {roleCounts.owner}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                className="flex w-fit flex-col items-center justify-center gap-0 sm:flex-row"
              >
                <span>Editor</span>
                <Badge
                  variant="secondary"
                  className="bg-background/70 text-muted-foreground flex size-5 items-center justify-center text-xs"
                >
                  {roleCounts.editor}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="viewer"
                className="flex w-fit flex-col items-center justify-center gap-0 sm:flex-row"
              >
                <span>Viewer</span>
                <Badge
                  variant="secondary"
                  className="bg-background/70 text-muted-foreground flex size-5 items-center justify-center text-xs"
                >
                  {roleCounts.viewer}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Sort By */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        {boards.length > 0 && searchQuery && (
          <div className="text-muted-foreground text-sm">
            {filteredBoards.length === 0 ? (
              "No boards found"
            ) : (
              <>
                Showing {filteredBoards.length} of {boards.length} board
                {boards.length !== 1 ? "s" : ""}
              </>
            )}
          </div>
        )}

        {/* Boards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading your boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex items-center justify-center">
              <SparkleIcon
                weight="duotone"
                className="text-muted-foreground h-16 w-16"
              />
            </div>
            <h3 className="mb-2 text-2xl font-medium">
              You don&apos;t have any boards yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first board to organize your ideas.
            </p>
            <Button variant="outline" onClick={() => setShowAddBoard(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Board
            </Button>
          </div>
        ) : filteredBoards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex items-center justify-center">
              <Search className="text-muted-foreground h-16 w-16" />
            </div>
            <h3 className="mb-2 text-2xl font-medium">No boards found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery
                ? "Try adjusting your search to find what you're looking for."
                : "No boards found with the selected role filter."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBoards.map((board) => (
              <FolderListCard
                key={board._id}
                board={board}
                onUpdate={() => handleRefetch()}
              />
            ))}
          </div>
        )}
      </section>

      <AddBoardDialog
        open={showAddBoard}
        onOpenChange={setShowAddBoard}
        onSuccess={() => {
          setShowAddBoard(false);
          // React Query will automatically refetch after mutation
        }}
      />
    </>
  );
}
