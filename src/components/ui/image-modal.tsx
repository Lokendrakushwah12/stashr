"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

// Ported from lokendra.tech's components/ui/image-modal.tsx: the thumbnail
// and the full view share a layoutId, so a click springs the image open in
// place. Here the thumbnail keeps the caller's styling (no default margins
// or width), and reduced motion gets a plain fade instead of the zoom.
interface ImageModalProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export default function ImageModal({
  src,
  alt,
  title,
  className,
}: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  const id = useId();
  const layoutId = reduced ? undefined : id;

  // a cached image can finish before hydration, so onLoad never fires for it
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <MotionConfig
      transition={{ type: "spring", stiffness: 550, damping: 35, mass: 0.6 }}
    >
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        title={title}
        layoutId={layoutId}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "block cursor-zoom-in",
          className,
          // Last, so a caller's own background can't hide it.
          !loaded && "bg-muted animate-pulse text-transparent",
        )}
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      />

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-label={alt || "Image"}
              >
                <motion.div
                  className="absolute inset-0 bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleClose}
                />
                <div className="pointer-events-none relative z-10 flex max-h-full max-w-6xl items-center justify-center">
                  <div className="pointer-events-auto relative">
                    <motion.button
                      type="button"
                      className="absolute -top-10 right-0 rounded-sm bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        transition: { delay: 0.1 },
                      }}
                      exit={{ opacity: 0, transition: { duration: 0.05 } }}
                      transition={{ duration: 0.1 }}
                      onClick={handleClose}
                      aria-label="Close image"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                    <motion.img
                      layoutId={layoutId}
                      src={src}
                      alt={alt}
                      initial={reduced ? { opacity: 0 } : undefined}
                      animate={reduced ? { opacity: 1 } : undefined}
                      exit={reduced ? { opacity: 0 } : undefined}
                      className="bg-sidebar max-h-[85vh] w-full cursor-zoom-out rounded-md object-contain shadow-2xl"
                      onClick={handleClose}
                    />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </MotionConfig>
  );
}
