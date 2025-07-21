"use client";

import AddFolderDialog from '@/components/bookmark/AddFolderDialog';
import FolderCard from '@/components/bookmark/FolderCard';
import { Button } from "@/components/ui/button";
import { folderApi } from '@/lib/api';
import type { Folder } from '@/types';
import { Bookmark, FolderClosed, Loader, Plus, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FolderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await folderApi.getAll();

      if (response.data) {
        setFolders(response.data.folders);
      } else {
        setError(response.error ?? 'Failed to fetch folders');
      }
    } catch {
      setError('An error occurred while fetching folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      void fetchFolders();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <>LOLLLLLLLLLLL</>; // Will redirect
  }

  if (error) {
    return (
      <section className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-md">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchFolders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container space-y-8 pt-24 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
            <p className="text-muted-foreground mt-2">
              Organize and manage your web bookmarks in folders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchFolders}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddFolder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Folder
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border relative rounded-2xl bg-secondary/20 p-4">
            <div className="absolute right-2 top-2 p-2 bg-accent rounded-xl">
              <FolderClosed className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold">{folders.length}</div>
            <div className="text-sm text-muted-foreground">Total Folders</div>
          </div>
          <div className="border relative rounded-2xl bg-secondary/20 p-4">
            <div className="absolute right-2 top-2 p-2 bg-accent rounded-xl">
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold">
              {folders.reduce((acc, folder) => acc + folder.bookmarks.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Bookmarks</div>
          </div>
        </div>

        {/* Folders Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your bookmarks...</p>
          </div>
        ) : (
          folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No folders yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Get started by creating your first folder to organize your bookmarks.
              </p>
              <Button onClick={() => setShowAddFolder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Folder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder) => (
                <FolderCard
                  key={folder._id}
                  folder={folder}
                  onUpdate={fetchFolders}
                />
              ))}
            </div>
          )
        )}
      </section>

      <AddFolderDialog
        open={showAddFolder}
        onOpenChange={setShowAddFolder}
        onSuccess={fetchFolders}
      />
    </>
  );
} 