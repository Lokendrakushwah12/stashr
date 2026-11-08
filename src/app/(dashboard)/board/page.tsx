"use client";

import AddBoardDialog from "@/components/board/AddBoardDialog";
import FolderListCard from "@/components/board/BoardFolder/FolderListCard";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
import type { Board } from "@/types";
import {
  AddFolder,
  Share,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Magnifer, Sort } from "@solar-icons/react-perf/Outline";
import { Plus, X } from "lucide-react";
import { Skeleton } from "skullet/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Shapes the first skeleton (skullet remembers the real one after a visit).
const SAMPLE_BOARDS: Board[] = [
  "Weekend ideas",
  "Launch plan",
  "Reading list",
  "Design refs",
].map((name, i) => ({
  _id: `sample-${i}`,
  name,
  userRole: "owner",
  updatedAt: new Date().toISOString(),
}));

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

  // One fetch (team boards + boards shared with you); tabs filter client-side
  const {
    data: boardsResponse,
    isLoading,
    refetch: originalRefetch,
  } = useBoards(sortBy, "all");

  // Custom refetch with toast notification
  const handleRefetch = async () => {
    try {
      await originalRefetch();
      toast.success("Boards refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh boards");
    }
  };

  const allBoards = useMemo(
    () => boardsResponse?.data?.boards ?? [],
    [boardsResponse],
  );
  const teamBoards = useMemo(
    () => allBoards.filter((b) => !b.shared),
    [allBoards],
  );
  const sharedBoards = useMemo(
    () => allBoards.filter((b) => b.shared),
    [allBoards],
  );

  // Shared boards live only under the Shared tab; the rest are this team's.
  const boards = useMemo(() => {
    if (roleFilter === "shared") return sharedBoards;
    if (roleFilter === "all") return teamBoards;
    return teamBoards.filter((b) => b.userRole === roleFilter);
  }, [roleFilter, teamBoards, sharedBoards]);

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

  const roleCounts = useMemo(() => {
    return {
      all: teamBoards.length,
      owner: teamBoards.filter((b) => b.userRole === "owner").length,
      editor: teamBoards.filter((b) => b.userRole === "editor").length,
      viewer: teamBoards.filter((b) => b.userRole === "viewer").length,
      shared: sharedBoards.length,
    };
  }, [teamBoards, sharedBoards]);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
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
              <AddFolder className="h-4 w-4" />
              Add Board
            </Button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Magnifer className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search boards..."
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
              <TabsTrigger
                value="shared"
                className="flex w-fit flex-col items-center justify-center gap-0 sm:flex-row"
              >
                <span>Shared</span>
                <Badge
                  variant="secondary"
                  className="bg-background/70 text-muted-foreground flex size-5 items-center justify-center text-xs"
                >
                  {roleCounts.shared}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Sort By */}
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

        {/* Boards Grid: one element from skeleton to cards */}
        {isLoading || filteredBoards.length > 0 ? (
          <Skeleton
            data={isLoading ? null : filteredBoards}
            sample={SAMPLE_BOARDS}
            id="boards-grid"
            label="Loading boards"
          >
            {(list) => (
              <div className="grid grid-cols-1 gap-8 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((board) => (
                  <FolderListCard
                    key={board._id}
                    board={board}
                    onUpdate={() => handleRefetch()}
                  />
                ))}
              </div>
            )}
          </Skeleton>
        ) : roleFilter === "shared" && boards.length === 0 ? (
          <EmptyState
            icon={<Share />}
            title="Nothing shared with you yet"
            description="Boards people outside your teams invite you to will show up here."
          />
        ) : teamBoards.length === 0 && roleFilter !== "shared" ? (
          <EmptyState
            icon={<AddFolder />}
            title="No boards yet"
            description="Boards hold the ideas, links and images for one topic. Start one and add your first note."
            action={
              <Button onClick={() => setShowAddBoard(true)}>
                <Plus className="h-4 w-4" />
                Create a board
              </Button>
            }
          />
        ) : filteredBoards.length === 0 ? (
          <EmptyState
            icon={<Magnifer />}
            title="No matching boards"
            description={
              searchQuery
                ? `Nothing matches “${searchQuery}”.`
                : "No boards with this role."
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : null}
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
