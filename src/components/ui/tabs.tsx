"use client";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { Transition } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode
} from "react";

type TabsContextType = {
  value: string;
  setValue: (val: string) => void;
  uniqueId: string;
  variant?: "filled" | "bordered";
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Must be used within <Tabs>");
  return context;
}

// Let's simplify and not use compound components for now
function Tabs({
  defaultValue,
  onValueChange,
  variant,
  children,
  className,
  style,
}: {
  defaultValue: string;
  onValueChange?: (val: string) => void;
  variant?: "filled" | "bordered";
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [value, setValue] = useState(defaultValue);
  const uniqueId = useId();

  const handleChange = (val: string) => {
    setValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value, setValue: handleChange, uniqueId, variant }}>
      <div className={cn("relative", className)} style={style} >{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className, style }: { children: ReactNode; className?: string, style?: React.CSSProperties }) {
  const { variant } = useTabsContext();
  return <div className={cn("flex relative", variant === "filled" && "p-px bg-accent/50 dark:bg-accent border rounded-lg", className)} style={style}>{children}</div>;
}

function TabsTrigger({
  value,
  children,
  className,
  transition = {
    type: 'spring',
    stiffness: 300,
    damping: 26,
  },
}: {
  value: string;
  children: ReactNode;
  className?: string;
  transition?: Transition;
}) {
  const { value: active, setValue, uniqueId, variant } = useTabsContext();
  const isActive = active === value;

  return (
    <div
      onClick={() => setValue(value)}
      data-checked={isActive}
      className={cn(
        "relative p-2 cursor-pointer transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            layoutId={`underline-${uniqueId}`}
            className={cn(
              "absolute inset-0",
              variant === "filled" && "bg-primary text-center rounded-md shadow-sm border border-border",
              variant === "bordered" && "border-b-2 border-primary"
            )}
            transition={transition}
          />
        )}
      </AnimatePresence>
      <span className="relative flex justify-center items-center gap-2 z-10">{children}</span>
    </div>
  );
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: active } = useTabsContext();

  if (active !== value) return null;

  return <div className={cn("mt-[6px]", className)}>{children}</div>;
}

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };

