import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-mono uppercase rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-400/20 text-green-600 dark:bg-green-600/20 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-400/20 text-yellow-600 dark:bg-yellow-600/20 dark:text-yellow-400",
        info:
          "border-transparent bg-blue-400/20 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400",
        gray:
          "border-transparent bg-gray-400/20 text-gray-600 dark:bg-gray-600/20 dark:text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
