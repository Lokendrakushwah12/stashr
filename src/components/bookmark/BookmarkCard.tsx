"use client";

import Stashr from "@/assets/svgs/assets/svgs/Stashr";
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
import { useEffect, useState } from 'react';

// Type for the meta image extraction API response
interface ExtractionResult {
    success: boolean;
    imageUrl: string;
    fallbackUsed: boolean;
    error?: string;
    debug?: {
        strategy: string;
        extractedUrl?: string;
        validationPassed?: boolean;
    };
}

interface BookmarkCardProps {
    bookmark: Bookmark;
    onEdit: (bookmark: Bookmark) => void;
    onDelete: (bookmarkId: string) => void;
}

const BookmarkCard = ({ bookmark, onEdit, onDelete }: BookmarkCardProps) => {
    const [metaImageUrl, setMetaImageUrl] = useState<string>('');
    const [isExtracting, setIsExtracting] = useState(false);

    // Initialize with stored meta image or fallback, then try to extract if needed
    useEffect(() => {
        let isCancelled = false;
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 10000);

        const initializeImage = async () => {
            if (bookmark.metaImage && bookmark.metaImage !== '') {
                setMetaImageUrl(bookmark.metaImage);
                setIsExtracting(false);
                return;
            }

            setMetaImageUrl('');
            setIsExtracting(true);

            try {
                const response = await fetch(
                    `/api/meta-image?url=${encodeURIComponent(bookmark.url)}`,
                    { signal: controller.signal }
                );
                if (!response.ok) throw new Error(`status ${response.status}`);
                const result = (await response.json()) as ExtractionResult;

                if (isCancelled) return;

                if (result.success && !result.fallbackUsed && result.imageUrl) {
                    setMetaImageUrl(result.imageUrl);
                } else {
                    // Keep fallback
                    setMetaImageUrl('');
                }
            } catch (_error) {
                if (!isCancelled) {
                    // On error, just show fallback and stop
                    setMetaImageUrl('');
                }
            } finally {
                if (!isCancelled) {
                    setIsExtracting(false);
                }
            }
        };

        void initializeImage();

        return () => {
            isCancelled = true;
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [bookmark.metaImage, bookmark.url]);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            onDelete(bookmark._id!);
        }
    };

    const handleEdit = () => {
        onEdit(bookmark);
    };

    return (
        <Card className="rounded-2xl mb-2 bg-secondary/20 relative z-10 overflow-hidden hover:bg-accent/50 transition-all group">
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

                {/* Meta Image Preview */}
                <div className="mt-4 border rounded-xl overflow-hidden bg-background relative">
                    <div className="relative w-full h-48 overflow-hidden">
                        {/* Show image if available, otherwise show unavailable */}
                        {metaImageUrl ? (
                            <img
                                src={metaImageUrl}
                                alt={`Preview of ${bookmark.title}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                // onLoad={() => console.log(`✅ Image loaded: ${metaImageUrl}`)}
                                onError={(e) => {
                                    console.error(`❌ Image failed to load: ${metaImageUrl}`, e);
                                    e.currentTarget.style.display = 'none';
                                    // Show fallback text
                                    const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallbackDiv) {
                                        fallbackDiv.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}

                        {/* Fallback text when no image or image fails */}
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ display: metaImageUrl ? 'none' : 'flex' }}
                        >
                            <div className="flex flex-col items-center justify-center p-4">
                                <Stashr width={44} />
                                <p className="text-sm mt-6 text-muted-foreground">Preview unavailable</p>
                            </div>
                        </div>

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-accent/10 transition-colors duration-300 pointer-events-none" />

                        {/* Extraction indicator */}
                        {isExtracting && (
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                Extracting...
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookmarkCard; 