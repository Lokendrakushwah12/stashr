"use client";

import AddFolderDialog from "@/components/bookmark/AddFolderDialog";
import FolderCard from "@/components/bookmark/FolderCard";
import ImportExportDialog from "@/components/bookmark/ImportExportDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolders } from "@/lib/hooks/use-bookmarks";
import {
  BookmarksIcon,
  FolderOpenIcon,
  FoldersIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Loader, Plus, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AllBookmarksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  // Use React Query for data fetching
  const {
    data: foldersResponse,
    isLoading,
    refetch: originalRefetch,
  } = useFolders();

  // Custom refetch with toast notification
  const handleRefetch = async () => {
    try {
      await originalRefetch();
      toast.success("Bookmarks refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh bookmarks");
    }
  };

  const folders = foldersResponse?.data?.folders ?? [];

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
            <Button
              onClick={() => setShowImportExport(true)}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4" />
              Import/Export
            </Button>
            <Button onClick={() => setShowAddFolder(true)}>
              <PlusIcon weight="duotone" className="h-4 w-4" />
              Add Folder
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border">
            <div className="flex w-full flex-col items-start justify-center p-4">
              {isLoading ? (
                <Skeleton className="mb-1 h-9 w-16" />
              ) : (
                <div className="font-mono text-3xl font-semibold">
                  {folders.length}
                </div>
              )}
              <div className="text-muted-foreground text-sm">Total Folders</div>
            </div>
            <div className="bg-muted/30 bg-lines-diag flex h-full items-center justify-center px-9">
              <FoldersIcon
                weight="duotone"
                strokeWidth={1}
                className="text-muted-foreground size-10"
              />
            </div>
          </div>
          <div className="bg-secondary/20 relative flex overflow-hidden rounded-2xl border">
            <div className="flex w-full flex-col items-start justify-center p-4">
              {isLoading ? (
                <Skeleton className="mb-1 h-9 w-16" />
              ) : (
                <div className="font-mono text-3xl font-semibold">
                  {folders.reduce(
                    (acc, folder) => acc + (folder.bookmarkCount ?? 0),
                    0,
                  )}
                </div>
              )}
              <div className="text-muted-foreground text-sm">
                Total Bookmarks
              </div>
            </div>
            <div className="bg-muted/30 bg-lines-diag flex h-full items-center justify-center px-9">
              <BookmarksIcon
                weight="duotone"
                strokeWidth={1}
                className="thin-stroke text-muted-foreground size-10"
              />
            </div>
          </div>
        </div>

        {/* Folders Grid */}
        {isLoading ? (
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="absolute inset-0 z-10 bg-linear-to-b from-transparent to-[#fafafa] dark:to-[#0f0f11]" />
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-32 rounded-2xl p-0">
                <CardHeader className="flex h-full w-full flex-col items-center justify-between gap-0 p-2">
                  <div className="flex w-full items-center justify-between gap-2">
                    <Skeleton className="ml-32 h-6 w-32" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Skeleton className="mx-auto h-4 w-[60%]" />
                    <Skeleton className="mx-auto h-4 w-3/4" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex items-center justify-center">
              <FolderOpenIcon
                weight="duotone"
                className="text-muted-foreground h-16 w-16"
              />
            </div>
            <h3 className="mb-2 text-2xl font-medium">
              You don&apos;t have any folders yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first folder to organize your
              bookmarks.
            </p>
            <Button variant="outline" onClick={() => setShowAddFolder(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onUpdate={() => handleRefetch()}
              />
            ))}
          </div>
        )}
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
