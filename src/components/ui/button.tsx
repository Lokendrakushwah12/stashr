import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center active:scale-98 gap-2 whitespace-nowrap select-none cursor-pointer rounded-lg border bg-clip-padding text-sm font-medium ring-offset-background transition-all ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/24 not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] hover:bg-primary/90 [&:is(:active,[data-pressed])]:inset-shadow-[0_1px_--theme(--color-black/8%)] [&:is(:disabled,:active,[data-pressed])]:shadow-none",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs shadow-destructive/24 not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] [&:is(:active,[data-pressed])]:inset-shadow-[0_1px_--theme(--color-black/8%)] [&:is(:disabled,:active,[data-pressed])]:shadow-none",
        outline:
          "border-border bg-background shadow-xs dark:bg-input/32 dark:not-in-data-[slot=group]:bg-clip-border [&:is(:disabled,:active,[data-pressed])]:shadow-none [&:is(:hover,[data-pressed])]:bg-accent/5 dark:[&:is(:hover,[data-pressed])]:bg-input/64",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90",
        ghost: "border-transparent hover:bg-accent data-pressed:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
