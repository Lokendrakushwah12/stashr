"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Link as LinkIcon, Trash2, Edit } from "lucide-react";
import { useState } from "react";

interface BoardCardProps {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  linkedFolder?: {
    id: string;
    name: string;
    color: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLinkFolder?: (id: string) => void;
}

const statusConfig = {
  todo: { label: "To Do", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  done: { label: "Done", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  high: { label: "High", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export default function BoardCard({
  id,
  title,
  description,
  status,
  priority,
  linkedFolder,
  onEdit,
  onDelete,
  onLinkFolder,
}: BoardCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-md border-border/50 hover:border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${statusConfig[status].color}`}
            >
              {statusConfig[status].label}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isHovered ? "opacity-100" : ""
                  }`}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit?.(id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Card
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLinkFolder?.(id)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link Folder
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${priorityConfig[priority].color}`}
            >
              {priorityConfig[priority].label}
            </Badge>
            
            {linkedFolder && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: linkedFolder.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {linkedFolder.name}
                </span>
              </div>
            )}
          </div>
          
          {!linkedFolder && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onLinkFolder?.(id)}
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Link Folder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
