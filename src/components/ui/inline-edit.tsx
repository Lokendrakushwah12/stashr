"use client";

import { cn } from "@/lib/utils";
import { Pen } from "@solar-icons/react-perf/category/style/BoldDuotone";
import { useEffect, useRef, useState } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  disabled?: boolean;
  maxLength?: number;
  allowEmpty?: boolean;
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
}

export default function InlineEdit({
  value,
  onSave,
  placeholder = "Click to edit...",
  className = "",
  multiline = false,
  disabled = false,
  maxLength,
  allowEmpty = false,
  fontSize = "base",
  fontWeight = "normal",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const initialValueRef = useRef(value);

  useEffect(() => {
    initialValueRef.current = value;
    if (editableRef.current && !isEditing) {
      const isEmpty = !value || value.trim() === "";
      editableRef.current.textContent = isEmpty ? placeholder : value;
    }
  }, [value, isEditing, placeholder]);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Move cursor to end
      const range = document.createRange();
      const selection = window.getSelection();
      const contentLength = editableRef.current.textContent?.length ?? 0;

      if (editableRef.current.firstChild && contentLength > 0) {
        range.setStart(editableRef.current.firstChild, contentLength);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing]);

  const handleSave = async () => {
    const currentValue = editableRef.current?.textContent?.trim() ?? "";

    if (currentValue === initialValueRef.current.trim()) {
      setIsEditing(false);
      return;
    }

    // If allowEmpty is false and current value is empty, revert to original value
    if (!allowEmpty && currentValue === "") {
      if (editableRef.current) {
        const isEmpty =
          !initialValueRef.current || initialValueRef.current.trim() === "";
        editableRef.current.textContent = isEmpty
          ? placeholder
          : initialValueRef.current;
      }
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(currentValue);
      initialValueRef.current = currentValue;
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      if (editableRef.current) {
        const isEmpty =
          !initialValueRef.current || initialValueRef.current.trim() === "";
        editableRef.current.textContent = isEmpty
          ? placeholder
          : initialValueRef.current;
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (editableRef.current) {
      const isEmpty =
        !initialValueRef.current || initialValueRef.current.trim() === "";
      editableRef.current.textContent = isEmpty
        ? placeholder
        : initialValueRef.current;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Check max length
    if (maxLength && editableRef.current) {
      const currentLength = editableRef.current.textContent?.length ?? 0;
      if (
        currentLength >= maxLength &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        return;
      }
    }

    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Enter" && multiline && (e.metaKey ?? e.ctrlKey)) {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const fontSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  };

  const fontWeightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const handleClick = () => {
    if (!disabled && !isEditing) {
      setIsEditing(true);
    }
  };

  const isEmpty = !value || value.trim() === "";

  return (
    <div
      className={cn(
        "group relative cursor-text rounded-md transition-all",
        "-ml-2 px-2 py-1",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={handleClick}
    >
      <div
        ref={editableRef}
        contentEditable={isEditing && !disabled}
        suppressContentEditableWarning
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        spellCheck={true}
        role="textbox"
        aria-label={placeholder}
        aria-readonly={!isEditing}
        aria-multiline={multiline}
        className={cn(
          "w-full bg-transparent outline-none",
          "focus:outline-none",
          "break-words whitespace-pre-wrap",
          fontSizeClasses[fontSize],
          fontWeightClasses[fontWeight],
          isEmpty && !isEditing && "text-muted-foreground",
          !multiline && "overflow-hidden text-ellipsis whitespace-nowrap",
        )}
      >
        {isEmpty && !isEditing ? placeholder : value || ""}
      </div>

      {!disabled && !isEditing && (
        <div className="pointer-events-none absolute top-1/2 -right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <Pen className="text-muted-foreground h-4 w-4" />
        </div>
      )}

      {isSaving && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
