"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

// Predefined color palette
const COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Slate", value: "#64748b" },
  { name: "Gray", value: "#6b7280" },
  { name: "Zinc", value: "#71717a" },
];

export default function ColorPicker({
  value,
  onChange,
  disabled = false,
  children,
}: ColorPickerProps) {
  const handleColorSelect = (color: string) => {
    onChange(color);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ?? (
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "size-5 rounded-sm border border-border transition-all",
              "hover:scale-110 hover:border-border/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
            style={{ backgroundColor: value }}
          />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Choose a color</h4>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleColorSelect(color.value)}
                disabled={disabled}
                className={cn(
                  "relative h-10 w-10 rounded-md border-2 transition-all",
                  "hover:scale-110 hover:border-foreground/20",
                  value.toLowerCase() === color.value.toLowerCase()
                    ? "border-foreground ring-2 ring-foreground/20"
                    : "border-transparent",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {value.toLowerCase() === color.value.toLowerCase() && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckIcon
                      weight="bold"
                      className="h-5 w-5 text-white drop-shadow-lg"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

