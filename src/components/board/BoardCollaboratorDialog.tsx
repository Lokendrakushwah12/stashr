"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import {
  useAddBoardCollaborator,
  useBoardCollaborators,
  useRemoveBoardCollaborator,
  useUpdateBoardCollaboratorRole,
} from "@/lib/hooks/use-board-collaborators";
import type { BoardCollaboration } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";

interface BoardCollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
}

export default function BoardCollaboratorDialog({
  open,
  onOpenChange,
  boardId,
  boardName,
}: BoardCollaboratorDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');

  // Use custom hooks
  const { data: collaboratorsResponse, isLoading } = useBoardCollaborators(boardId, open);
  const addCollaboratorMutation = useAddBoardCollaborator(boardId);
  const updateRoleMutation = useUpdateBoardCollaboratorRole(boardId);
  const removeCollaboratorMutation = useRemoveBoardCollaborator(boardId);

  const collaborators: BoardCollaboration[] = collaboratorsResponse?.data?.collaborations ?? [];

  const handleAddCollaborator = async () => {
    if (!email?.includes('@')) return;
    await addCollaboratorMutation.mutateAsync({ email, role });
    setEmail("");
    setRole('viewer');
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: 'editor' | 'viewer') => {
    updateRoleMutation.mutate({ collaboratorId, role: newRole });
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    removeCollaboratorMutation.mutate(collaboratorId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600';
      case 'editor': return 'text-blue-600';
      case 'viewer': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on &quot;{boardName}&quot; by adding their email address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-3 bg-background border border-border/70 rounded-xl">
          {/* Add new collaborator */}
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={addCollaboratorMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(value: 'editor' | 'viewer') => setRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddCollaborator}
                disabled={!email || !email.includes('@') || addCollaboratorMutation.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {addCollaboratorMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>

          {/* Current collaborators */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current collaborators</h3>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading collaborators...</div>
            ) : collaborators.length === 0 ? (
              <div className="text-sm text-muted-foreground">No collaborators yet. Add someone to get started!</div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                <div
                  key={collaborator._id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.userImage ?? ""} alt={collaborator.userName ?? collaborator.userEmail} />
                      <AvatarFallback className="text-xs">
                        {collaborator.userName 
                          ? collaborator.userName.split(' ').map(n => n[0]).join('').toUpperCase()
                          : collaborator.userEmail[0]?.toUpperCase() ?? '?'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {collaborator.userName ?? collaborator.userEmail}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(collaborator.status)}`}>
                          {collaborator.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{collaborator.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {collaborator.role !== 'owner' && (
                      <Select
                        value={collaborator.role}
                        onValueChange={(newRole: 'editor' | 'viewer') => handleUpdateRole(collaborator._id, newRole)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {collaborator.role === 'owner' && (
                      <Badge variant="default" className="px-3 h-8 flex items-center">
                        Owner
                      </Badge>
                    )}
                    {collaborator.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collaborator._id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
