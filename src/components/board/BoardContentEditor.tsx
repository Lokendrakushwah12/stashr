"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InlineEdit from "@/components/ui/inline-edit";
import { useSession } from "next-auth/react";

interface BoardContentEditorProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  disabled?: boolean;
  userRole?: 'owner' | 'editor' | 'viewer';
}

export default function BoardContentEditor({
  value,
  onSave,
  disabled = false,
  userRole = 'viewer',
}: BoardContentEditorProps) {
  const { data: session } = useSession();
  
  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U";

  return (
    <div className="space-y-3 flex justify-start items-start">
      {/* User info outside card */}
      <div className="flex items-center gap-3">
        <Avatar className="size-7 rounded-sm">
          <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
          <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{session?.user?.name}</span>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${
              userRole === 'owner' ? 'bg-purple-500' : 
              userRole === 'editor' ? 'bg-blue-500' : 
              'bg-gray-400'
            }`} />
            <span className="text-xs text-muted-foreground capitalize">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">

      {/* Content area */}
      <div className="p-6">
        <InlineEdit
          value={value}
          onSave={onSave}
          placeholder="Start writing your ideas, paste images, add links, organize your thoughts...

# Getting Started
Use markdown to format your content:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- [Links](https://example.com) to reference resources
- Lists for organization

# Ideas Section
Share your thoughts here...

# Resources
- Link 1
- Link 2

# Next Steps
What's the plan?"
          fontSize="base"
          fontWeight="normal"
          disabled={disabled}
          multiline
          maxLength={50000}
          allowEmpty={true}
          className="min-h-[600px] text-foreground prose prose-sm max-w-none focus:outline-none"
        />
      </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {disabled 
              ? "You have view-only access to this board" 
              : "Markdown supported • Click to edit • Changes save automatically"
            }
          </p>
        </div>
      </div>
    </div>
  );
}

