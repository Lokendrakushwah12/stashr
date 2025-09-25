"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useState } from "react";
import CollaboratorDialog from "./CollaboratorDialog";

interface CollaboratorButtonProps {
  folderId: string;
  folderName: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function CollaboratorButton({
  folderId,
  folderName,
  variant = "outline",
  size = "sm",
  className,
}: CollaboratorButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={className}
      >
        <Users className="h-4 w-4" />
        <span className="ml-2">Collaborators</span>
      </Button>

      <CollaboratorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        folderId={folderId}
        folderName={folderName}
      />
    </>
  );
}
