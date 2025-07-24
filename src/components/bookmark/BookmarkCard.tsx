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
import { useCallback, useEffect, useState } from 'react';

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

    const extractMetaImageAsync = useCallback(async () => {
        if (isExtracting) return;
        
        setIsExtracting(true);
        try {
            // console.log(`🔍 BookmarkCard: Extracting meta image for: ${bookmark.url}`);
            const response = await fetch(`/api/meta-image?url=${encodeURIComponent(bookmark.url)}`);
            if (response.ok) {
                const result = await response.json() as ExtractionResult;
                // console.log(`✅ BookmarkCard: Extraction result:`, result);
                
                if (result.success && !result.fallbackUsed && result.imageUrl) {
                    // console.log(`📸 BookmarkCard: Setting extracted image: ${result.imageUrl}`);
                    setMetaImageUrl(result.imageUrl);
                } else {
                    // console.log(`🔄 BookmarkCard: Using fallback (extraction failed or fallback used)`);
                    // console.log(`🔄 BookmarkCard: Current metaImageUrl: ${metaImageUrl}`);
                }
            } else {
                console.error(`❌ BookmarkCard: API error: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ BookmarkCard: Failed to extract meta image:', error);
        } finally {
            setIsExtracting(false);
        }
    }, [bookmark.url, isExtracting, metaImageUrl]);

    // Initialize with stored meta image or fallback, then try to extract if needed
    useEffect(() => {
        const initializeImage = async () => {
            // If we have a stored meta image, use it
            if (bookmark.metaImage && bookmark.metaImage !== '') {
                // console.log(`📸 BookmarkCard: Using stored meta image: ${bookmark.metaImage}`);
                setMetaImageUrl(bookmark.metaImage);
            } else {
                // Start with empty state, then try to extract
                // console.log(`🔄BookmarkCard: No stored meta image, will try to extract`);
                setMetaImageUrl('');
                
                // Try to extract meta image asynchronously
                void extractMetaImageAsync();
            }
        };

        void initializeImage();
    }, [bookmark.metaImage, bookmark.url, extractMetaImageAsync]);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            onDelete(bookmark._id!);
        }
    };

    const handleEdit = () => {
        onEdit(bookmark);
    };

    return (
        <Card className="rounded-2xl mb-2 bg-secondary/20 relative z-10 overflow-hidden group">
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
                            className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
                            style={{ display: metaImageUrl ? 'none' : 'flex' }}
                        >
                            <div className="text-center p-4">
                                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {bookmark.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">Preview unavailable</p>
                            </div>
                        </div>
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                        
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