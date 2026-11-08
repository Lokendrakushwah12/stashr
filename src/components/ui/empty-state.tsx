import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Empty screen: a faint dashed outline of what will fill the space, the
 * icon in the middle tile, then one heading, one line and an optional action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="mb-6 grid w-64 grid-cols-3 gap-2.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "border-border/70 flex h-16 items-center justify-center rounded-lg border border-dashed",
              i === 1
                ? "bg-muted/40 text-muted-foreground -translate-y-1.5 [&_svg]:size-6"
                : "opacity-60",
            )}
          >
            {i === 1 && icon}
          </div>
        ))}
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm text-balance">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
