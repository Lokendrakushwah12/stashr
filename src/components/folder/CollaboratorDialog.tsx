"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FolderCollaboration } from "@/types";
import { UserPlusIcon, UsersIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface CollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  folderName: string;
}

interface CollaboratorFormData {
  email: string;
  role: 'editor' | 'viewer';
}

export default function CollaboratorDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
}: CollaboratorDialogProps) {
  const [collaborators, setCollaborators] = useState<FolderCollaboration[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<CollaboratorFormData>({
    email: '',
    role: 'editor',
  });

  const fetchCollaborators = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/folders/${folderId}/collaborators`);
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to fetch collaborators');
      }
      
      const data = await response.json() as { collaborators?: FolderCollaboration[] };
      setCollaborators(data.collaborators ?? []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  // Fetch collaborators when dialog opens
  useEffect(() => {
    if (open && folderId) {
      void fetchCollaborators();
    }
  }, [open, folderId, fetchCollaborators]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(`/api/folders/${folderId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error ?? 'Failed to add collaborator');
      }

      const data = await response.json() as { collaboration: FolderCollaboration };
      setCollaborators(prev => [...prev, data.collaboration]);
      setFormData({ email: '', role: 'editor' });
      toast.success('Collaborator added successfully');
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add collaborator');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCollaborator = async (collaborationId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/collaborators?collaboratorId=${collaborationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error ?? 'Failed to remove collaborator');
      }

      setCollaborators(prev => prev.filter(c => c._id !== collaborationId));
      toast.success('Collaborator removed successfully');
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove collaborator');
    }
  };

  const handleUpdateRole = async (collabId: string, newRole: 'editor' | 'viewer') => {
    try {
      
      const response = await fetch(`/api/folders/${folderId}/collaborators`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collaboratorId: collabId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error ?? 'Failed to update collaborator role');
      }

      setCollaborators(prev => prev.map(c => 
        c._id === collabId ? { ...c, role: newRole } : c
      ));
      toast.success('Collaborator role updated successfully');
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update collaborator role');
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon weight="duotone" className="h-5 w-5" />
            Manage Collaborators
          </DialogTitle>
          <DialogDescription>
            Add and manage collaborators for &quot;{folderName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-3 bg-background border border-border/70 rounded-xl">
          {/* Add Collaborator Form - Single Line */}
          <form onSubmit={handleAddCollaborator} className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter collaborator's email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            
            <div className="w-40">
              <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'editor' | 'viewer') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    {formData.role === 'editor' ? 'Editor' : 'Viewer'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex flex-col">
                      <span className="font-medium">Editor</span>
                      <span className="text-sm text-muted-foreground">
                        Can add, edit, and delete bookmarks
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col">
                      <span className="font-medium">Viewer</span>
                      <span className="text-sm text-muted-foreground">
                        Can only view bookmarks
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={adding} className="h-10">
              {adding ? (
                <>
                  Adding...
                </>
              ) : (
                <>
                  <UserPlusIcon weight="duotone" className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </form>

          {/* Collaborators List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Collaborators ({collaborators.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon weight="duotone" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No collaborators yet</p>
                <p className="text-sm">Add collaborators to allow others to contribute to this folder</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator._id} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {collaborator.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{collaborator.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Select
                                  value={collaborator.role}
                                  onValueChange={(value: 'editor' | 'viewer') => {
                                    if (collaborator._id) {
                                      void handleUpdateRole(collaborator._id, value);
                                    } else {
                                      toast.error('Collaborator ID not found');
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-24 h-6 text-xs">
                                    <SelectValue>
                                      <Badge variant={collaborator.role === 'editor' ? 'info' : 'gray'} className="text-xs px-1 py-0">
                                        {collaborator.role}
                                      </Badge>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="editor">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="info" className="text-xs">Editor</Badge>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="viewer">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="gray" className="text-xs">Viewer</Badge>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Badge variant={
                                  collaborator.status === 'accepted' ? 'success' : 
                                  collaborator.status === 'pending' ? 'warning' : 
                                  'destructive'
                                } className="text-xs">
                                  {collaborator.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCollaborator(collaborator._id!)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <XIcon weight="duotone" className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
