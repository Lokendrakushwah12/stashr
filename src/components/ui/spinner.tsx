import { cn } from "@/lib/utils";

interface DefaultSpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
}

const DefaultSpinner = ({
  className,
  size = "md",
  ...props
}: DefaultSpinnerProps) => {
  return (
    <div
      {...props}
      aria-label="Loading..."
      data-slot="spinner-base"
      data-size={size}
      className={cn([
        "group relative inline-flex flex-col items-center justify-center gap-2",
        className,
      ])}
    >
      <div
        data-slot="spinner-wrapper"
        className={cn([
          "relative flex",
          "group-data-[size=lg]:h-10 group-data-[size=lg]:w-10 group-data-[size=md]:h-8 group-data-[size=md]:w-8 group-data-[size=sm]:h-4 group-data-[size=sm]:w-4",
        ])}
      >
        {[...new Array(12)].map((_, index) => (
          <i
            key={`default-${index}`}
            className={cn([
              "animate-fade-out absolute top-[calc(46%)] left-[calc(37.5%)] h-[8%] w-[25%] rounded-full bg-current",
            ])}
            style={
              {
                "--bar-index": index,
                animationDelay: `calc(-1.2s + (.1s * var(--bar-index)))`,
                transform: `rotate(calc(30deg * var(--bar-index))) translate(140%)`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
};

interface WaveSpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
}

const WaveSpinner = ({
  className,
  size = "md",
  ...props
}: WaveSpinnerProps) => {
  return (
    <div
      {...props}
      aria-label="Loading..."
      data-slot="spinner-base"
      data-size={size}
      className={cn([
        "group relative inline-flex flex-col items-center justify-center gap-2",
        className,
      ])}
    >
      <div
        data-slot="spinner-wrapper"
        className={cn([
          "relative flex",
          "group-data-[size=lg]:h-10 group-data-[size=lg]:w-10 group-data-[size=md]:h-8 group-data-[size=md]:w-8 group-data-[size=sm]:h-4 group-data-[size=sm]:w-4",
          "translate-y-3/4",
        ])}
      >
        {[...new Array(3)].map((_, index) => (
          <i
            key={`dot-${index}`}
            className={cn([
              "animate-sway relative mx-auto rounded-full bg-current",
              "group-data-[size=lg]:size-2 group-data-[size=md]:size-1.5 group-data-[size=sm]:size-1",
            ])}
            style={
              {
                "--dot-index": index,
                animationDelay: `calc(.25s * var(--dot-index))`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
};

interface DotsSpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
}

const DotsSpinner = ({
  className,
  size = "md",
  ...props
}: DotsSpinnerProps) => {
  return (
    <div
      {...props}
      aria-label="Loading..."
      data-slot="spinner-base"
      data-size={size}
      className={cn([
        "group relative inline-flex flex-col items-center justify-center gap-2",
        className,
      ])}
    >
      <div
        data-slot="spinner-wrapper"
        className={cn([
          "relative flex",
          "group-data-[size=lg]:h-10 group-data-[size=lg]:w-10 group-data-[size=md]:h-8 group-data-[size=md]:w-8 group-data-[size=sm]:h-4 group-data-[size=sm]:w-4",
          "translate-y-1/2",
        ])}
      >
        {[...new Array(3)].map((_, index) => (
          <i
            key={`dot-${index}`}
            className={cn([
              "animate-blink relative mx-auto rounded-full bg-current",
              "group-data-[size=lg]:size-2 group-data-[size=md]:size-1.5 group-data-[size=sm]:size-1",
            ])}
            style={
              {
                "--dot-index": index,
                animationDelay: `calc(.2s * var(--dot-index))`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
};

export { DefaultSpinner, WaveSpinner, DotsSpinner };
