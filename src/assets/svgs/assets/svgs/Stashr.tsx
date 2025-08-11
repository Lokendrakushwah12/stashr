import { cn } from "@/lib/utils";
import { SVGProps } from "react";

type StashrVariant =
    | "foreground"
    | "primary"
    | "muted"
    | "secondary"
    | "accent"
    | "destructive";

type StashrProps = SVGProps<SVGSVGElement> & {
    variant?: StashrVariant;
    duoOpacity?: number; // opacity for the secondary shape (0..1)
};

function Stashr({
    variant = "muted",
    duoOpacity = 0.2,
    className,
    ...props
}: StashrProps) {
    const variantClass: Record<StashrVariant, string> = {
        foreground: "text-foreground",
        primary: "text-primary",
        muted: "text-muted-foreground",
        secondary: "text-secondary-foreground",
        accent: "text-accent-foreground",
        destructive: "text-destructive",
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(variantClass[variant], className)}
            {...props}
        >
            {/* Primary block uses currentColor (from text-*) so it adapts to theme */}
            <rect width="24" height="24" rx="6" fill="currentColor" opacity={0.1} />

            {/* Secondary shape: same color, lower opacity for duo-tone effect */}
            <path
                d="M6.00098 9.96402V16.0408C6.00098 16.3339 6.15901 16.6149 6.44032 16.8221C6.72162 17.0293 7.10315 17.1457 7.50098 17.1457H16.501C16.8988 17.1457 17.2803 17.0293 17.5616 16.8221C17.8429 16.6149 18.001 16.3339 18.001 16.0408V9.96402"
                fill="currentColor"
                opacity={duoOpacity}
            />

            {/* Outlines use currentColor as well */}
            <path
                d="M6.00098 9.96402V16.0408C6.00098 16.3339 6.15901 16.6149 6.44032 16.8221C6.72162 17.0293 7.10315 17.1457 7.50098 17.1457H16.501C16.8988 17.1457 17.2803 17.0293 17.5616 16.8221C17.8429 16.6149 18.001 16.3339 18.001 16.0408V9.96402"
                stroke="currentColor"
                strokeWidth={0.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18.751 6.85425H5.25098C4.83676 6.85425 4.50098 7.12394 4.50098 7.45661V9.26371C4.50098 9.59638 4.83676 9.86607 5.25098 9.86607H18.751C19.1652 9.86607 19.501 9.59638 19.501 9.26371V7.45661C19.501 7.12394 19.1652 6.85425 18.751 6.85425Z"
                fill="#0000"
                stroke="currentColor"
                strokeWidth={0.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.501 13.1115H13.501"
                stroke="currentColor"
                strokeWidth={0.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_2440_1442"
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="#F6F6F6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default Stashr;