"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImage?: string | null;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ImageUpload({
  currentImage,
  onUploadComplete,
  onRemove,
  fallbackText = "U",
  size = "md",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { startUpload } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      setIsUploading(true);
      toast.loading("Uploading image...");
    },
    onClientUploadComplete: (res: Array<{ url: string }>) => {
      setIsUploading(false);
      if (res?.[0]?.url) {
        onUploadComplete(res[0].url);
        toast.dismiss();
        toast.success("Image uploaded successfully");
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      toast.dismiss();
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await startUpload([file]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-32 w-32",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={currentImage ?? ""} alt="Profile" />
        <AvatarFallback className={cn(
          size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl"
        )}>
          {fallbackText}
        </AvatarFallback>
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="absolute inset-0 flex items-center justify-center group pointer-events-none">
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md p-1 pointer-events-auto">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="size-8 aspect-square rounded-sm bg-background/80 hover:bg-background flex items-center justify-center cursor-pointer"
          >
            <Camera className="h-4 w-4" />
          </Button>
          {currentImage && onRemove && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onRemove}
              className="size-6 aspect-square rounded-sm bg-background/80 hover:bg-background flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
}

