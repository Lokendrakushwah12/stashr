"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const VIEW = 256; // crop viewport, CSS px
const OUT = 512; // exported square, px

/**
 * Square crop: drag to pan, slider to zoom, exports a 512px PNG (PNG keeps
 * logo transparency). ponytail: hand-rolled instead of react-easy-crop; it
 * flattens animated GIFs to one frame.
 */
function ImageCropDialog({
  file,
  onCancel,
  onCrop,
}: {
  file: File | null;
  onCancel: () => void;
  onCrop: (cropped: File) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: VIEW, h: VIEW });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // "cover" scale at zoom 1: the short side exactly fills the viewport
  const base = VIEW / Math.min(natural.w, natural.h);
  const clamp = (o: { x: number; y: number }, z: number) => {
    const maxX = (natural.w * base * z - VIEW) / 2;
    const maxY = (natural.h * base * z - VIEW) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    };
  };

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img || !file) return;
    const scale = base * zoom; // displayed px per source px
    const size = VIEW / scale;
    const sx = (natural.w * scale - VIEW) / 2 - offset.x;
    const sy = (natural.h * scale - VIEW) / 2 - offset.y;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    canvas
      .getContext("2d")
      ?.drawImage(img, sx / scale, sy / scale, size, size, 0, 0, OUT, OUT);
    canvas.toBlob((blob) => {
      if (!blob) return toast.error("Couldn't crop this image");
      const name = file.name.replace(/\.[^.]+$/, "") + ".png";
      onCrop(new File([blob], name, { type: "image/png" }));
    }, "image/png");
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription className="px-3 pt-1">
            Drag to reposition, use the slider to zoom.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 p-3">
          <div
            className="relative cursor-grab touch-none overflow-hidden rounded-lg border bg-black/40 active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              const last = drag.current;
              if (!last) return;
              drag.current = { x: e.clientX, y: e.clientY };
              setOffset((o) =>
                clamp(
                  { x: o.x + e.clientX - last.x, y: o.y + e.clientY - last.y },
                  zoom,
                ),
              );
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={src}
                alt="Image to crop"
                draggable={false}
                onLoad={(e) => {
                  const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                  setNatural({ w: w || VIEW, h: h || VIEW });
                }}
                className="absolute top-1/2 left-1/2 max-w-none select-none"
                style={{
                  width: natural.w * base * zoom,
                  height: natural.h * base * zoom,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}
          </div>
          <input
            type="range"
            aria-label="Zoom"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              const z = Number(e.target.value);
              setZoom(z);
              setOffset((o) => clamp(o, z));
            }}
            className="accent-primary w-full"
          />
        </div>
        <DialogFooter className="p-3 pt-0">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCrop} disabled={!src}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file); // crop first; upload happens on Apply
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
        <AvatarFallback
          className={cn(
            size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl",
          )}
        >
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
      <div className="group pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center justify-center gap-2 rounded-md bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="bg-background/80 hover:bg-background flex aspect-square size-8 cursor-pointer items-center justify-center rounded-sm"
          >
            <Camera className="h-4 w-4" />
          </Button>
          {currentImage && onRemove && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onRemove}
              className="bg-background/80 hover:bg-background flex aspect-square size-6 items-center justify-center rounded-sm"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ImageCropDialog
        file={pendingFile}
        onCancel={() => setPendingFile(null)}
        onCrop={(cropped) => {
          setPendingFile(null);
          void startUpload([cropped]);
        }}
      />

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
}
