"use client";

import AddFolderDialog from '@/components/bookmark/AddFolderDialog';
import FolderCard from '@/components/bookmark/FolderCard';
import ImportExportDialog from '@/components/bookmark/ImportExportDialog';
import CollaborationInvite from '@/components/notifications/CollaborationInvite';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolders } from '@/lib/hooks/use-bookmarks';
import type { FolderCollaboration, Folder } from '@/types';
import { ArrowsClockwiseIcon, BookmarksIcon, FolderOpenIcon, FoldersIcon, PlusIcon } from '@phosphor-icons/react';
import { Loader, Plus, RefreshCw, Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function FolderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<(FolderCollaboration & { folder?: Folder })[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Use React Query for data fetching
  const {
    data: foldersResponse,
    isLoading,
    error,
    refetch: originalRefetch
  } = useFolders();

  // Custom refetch with toast notification
  const handleRefetch = async () => {
    try {
      await originalRefetch();
      toast.success('Bookmarks refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh bookmarks');
    }
  };

  // Fetch all invitations (pending and accepted)
  const fetchPendingInvitations = async () => {
    if (!session?.user?.id) return;
    
    setLoadingInvitations(true);
    try {
      const response = await fetch('/api/collaborations/pending');
      if (!response.ok) throw new Error('Failed to fetch invitations');
      
      const data = await response.json();
      setPendingInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  // Handle accepting an invitation
  const handleAcceptInvitation = async (collaborationId: string) => {
    try {
      const response = await fetch(`/api/collaborations/${collaborationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (!response.ok) throw new Error('Failed to accept invitation');

      // Remove from pending list and refresh folders
      setPendingInvitations(prev => prev.filter(inv => inv._id !== collaborationId));
      await handleRefetch();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  };

  // Handle declining an invitation
  const handleDeclineInvitation = async (collaborationId: string) => {
    try {
      const response = await fetch(`/api/collaborations/${collaborationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to decline invitation');

      // Remove from pending list
      setPendingInvitations(prev => prev.filter(inv => inv._id !== collaborationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  };

  // Fetch invitations when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      void fetchPendingInvitations();
    }
  }, [session?.user?.id]);

  const folders = foldersResponse?.data?.folders ?? [];

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

  if (error) {
    return (
      <section className="max-w-[86rem] px-5 mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-md">
          <p className="text-destructive mb-4">{error.message}</p>
          <Button onClick={handleRefetch} variant="outline">
            <ArrowsClockwiseIcon weight="duotone" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-8 py-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Your Bookmarks</h1>
            <p className="text-muted-foreground mt-2">
              Organize and manage your web bookmarks in folders
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
              <PlusIcon weight='duotone' className="h-4 w-4" />
              Add Folder
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border flex relative rounded-2xl bg-secondary/20 overflow-hidden">
            <div className="flex flex-col w-full justify-center items-start p-4">
              {isLoading ? (
                <Skeleton className="h-9 w-16 mb-1" />
              ) : (
                <div className="text-3xl font-mono font-semibold">{folders.length}</div>
              )}
              <div className="text-sm text-muted-foreground">Total Folders</div>
            </div>
            <div className="flex justify-center items-center px-9 h-full bg-muted/30 bg-lines-diag">
              <FoldersIcon weight="duotone" strokeWidth={1} className="size-10 text-muted-foreground" />
            </div>
          </div>
          <div className="border flex relative rounded-2xl bg-secondary/20 overflow-hidden">
            <div className="flex flex-col w-full justify-center items-start p-4">
              {isLoading ? (
                <Skeleton className="h-9 w-16 mb-1" />
              ) : (
                <div className="text-3xl font-mono font-semibold">
                  {folders.reduce((acc, folder) => acc + (folder.bookmarkCount ?? 0), 0)}
                </div>
              )}
              <div className="text-sm text-muted-foreground">Total Bookmarks</div>
            </div>
            <div className="flex justify-center items-center px-9 h-full bg-muted/30 bg-lines-diag">
              <BookmarksIcon weight="duotone" strokeWidth={1} className="size-10 thin-stroke text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Collaboration Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Collaboration Invitations</h2>
              <div className="px-2 py-1 bg-warning/20 text-warning-600 dark:text-warning-400 rounded-full text-xs font-medium">
                {pendingInvitations.length}
              </div>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <CollaborationInvite
                  key={invitation._id}
                  collaboration={invitation}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Folders Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your bookmarks...</p>
          </div>
        ) : (
          folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center mb-4">
                <FolderOpenIcon weight="duotone" className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-medium mb-2">You don&apos;t have any folders yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Get started by creating your first folder to organize your bookmarks.
              </p>
              <Button variant="outline" onClick={() => setShowAddFolder(true)}>
                <Plus className="h-4 w-4" />
                Create Your First Folder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder) => (
                <FolderCard
                  key={folder._id}
                  folder={folder}
                  onUpdate={() => handleRefetch()}
                />
              ))}
            </div>
          )
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