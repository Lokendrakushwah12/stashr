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
  children,
  className,
  style,
}: {
  defaultValue: string;
  onValueChange?: (val: string) => void;
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
    <TabsContext.Provider value={{ value, setValue: handleChange, uniqueId }}>
      <div className={cn("relative", className)} style={style} >{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className, style }: { children: ReactNode; className?: string, style?: React.CSSProperties }) {
  return <div className={cn("flex relative", className)} style={style}>{children}</div>;
}

function TabsTrigger({
  value,
  children,
  className,
  style,
  transition = {
    type: 'spring',
    stiffness: 200,
    damping: 18,
  },
}: {
  value: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  transition?: Transition;
}) {
  const { value: active, setValue, uniqueId } = useTabsContext();
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
            className="absolute inset-0 border-b-2 border-primary"
            style={style}
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

