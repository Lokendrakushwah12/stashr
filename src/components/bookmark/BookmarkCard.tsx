"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Bookmark } from '@/types';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface BookmarkCardProps {
    bookmark: Bookmark;
    onEdit: (bookmark: Bookmark) => void;
    onDelete: (bookmarkId: string) => void;
}

const BookmarkCard = ({ bookmark, onEdit, onDelete }: BookmarkCardProps) => {
    const [showPreview, setShowPreview] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            onDelete(bookmark._id!);
        }
    };

    const handleEdit = () => {
        onEdit(bookmark);
    };

    return (
        <Card className="rounded-2xl mb-2 bg-secondary/20 relative z-10">
            <CardContent className="p-1 w-full">
                <div className="flex w-full items-center p-1 pb-0 sm:p-2 sm:pb-0">
                    <Link href={bookmark.url} target="_blank" className='w-full -mr-8'>
                        <div className="flex items-center gap-2 sm:gap-4 w-full">
                            <img
                                src={bookmark.favicon ?? `https://img.logo.dev/${new URL(bookmark.url).hostname}?token=pk_IgdfjsfTRDC5pflfc9nf1w&retina=true`}
                                alt="Favicon"
                                className="w-9 h-9 rounded-lg"
                                onError={(e) => {
                                    e.currentTarget.src = `https://img.logo.dev/${new URL(bookmark.url).hostname}?token=pk_IgdfjsfTRDC5pflfc9nf1w&retina=true`;
                                }}
                            />
                            <div className="w-full overflow-hidden">
                                <h3 className="font-semibold truncate">{bookmark.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
                                {bookmark.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {bookmark.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="sm"
                                className='size-9'
                            >
                                <DotsVerticalIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-2xl z-50">
                            {/* <DropdownMenuItem
                onClick={() => setShowPreview(!showPreview)}
                className="cursor-pointer rounded-xl"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </DropdownMenuItem> */}
                            <DropdownMenuItem
                                onClick={handleEdit}
                                className="cursor-pointer rounded-xl"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => window.open(bookmark.url, '_blank')}
                                className="cursor-pointer rounded-xl"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:text-destructive cursor-pointer rounded-xl"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Preview iframe */}
                <div className="mt-4 border rounded-xl overflow-hidden bg-background">
                    <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
                        <span className="text-sm font-medium">Preview</span>
                    </div>
                    <div className="relative w-full h-44 overflow-hidden">
                        <iframe
                         width="100%" height="100% "
                            src={bookmark.url}
                            className="w-full h-full border-0 pointer-events-none select-none iframe-preview"
                            title={`Preview of ${bookmark.title}`}
                            sandbox="allow-scripts allow-same-origin allow-forms"
                            loading="lazy"
                            scrolling="no"
                            style={{ minWidth: '1024px' }}
                            onError={(e) => {
                                console.error('Iframe failed to load:', e);
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookmarkCard; 