"use client";

import AddBoardDialog from "@/components/board/AddBoardDialog";
import BoardListCard from "@/components/board/BoardListCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoards } from "@/lib/hooks/use-boards";
import {
  ArrowsClockwiseIcon,
  SparkleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Loader, Plus, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BoardsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showAddBoard, setShowAddBoard] = useState(false);

  // Use React Query for data fetching
  const {
    data: boardsResponse,
    isLoading,
    refetch: originalRefetch,
  } = useBoards();

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

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      </div>
    );
  }

  return (
    <>
      <section className="space-y-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display tracking-tight">All Boards</h1>
            <p className="text-muted-foreground">
              Organize your ideas and concepts into boards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddBoard(true)}>
              <PlusIcon weight='duotone' className="h-4 w-4" />
              Add Board
            </Button>
          </div>
        </div>

        {/* Boards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your boards...</p>
          </div>
        ) : (
          boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center mb-4">
                <SparkleIcon weight="duotone" className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-medium mb-2">You don&apos;t have any boards yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Get started by creating your first board to organize your ideas.
              </p>
              <Button variant="outline" onClick={() => setShowAddBoard(true)}>
                <Plus className="h-4 w-4" />
                Create Your First Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <BoardListCard
                  key={board._id}
                  board={board}
                  onUpdate={() => handleRefetch()}
                />
              ))}
            </div>
          )
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