"use client";

import { logoDevFallbackFor } from "@/lib/favicon";
import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** "https://www.instagram.com/p/abc/" -> "instagram.com/p/abc" */
export function prettyUrl(href: string): string {
  try {
    const u = new URL(href);
    const path = u.pathname.replace(/\/$/, "");
    return `${u.host.replace(/^www\./, "")}${path}${u.search}`;
  } catch {
    return href;
  }
}

/** Slack-style link: site logo (logo.dev) + short URL, truncated. */
export function LinkChip({
  href,
  children,
}: {
  href: string;
  children?: ReactNode;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logo = /^https?:/i.test(href) ? logoDevFallbackFor(href) : null;
  const text = typeof children === "string" ? children : null;
  // Bare URLs read as the short form; links with their own label keep it.
  const label = !children || text === href ? prettyUrl(href) : children;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title={href}
      className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex max-w-[min(100%,24rem)] items-center gap-1 rounded-md px-1.5 align-middle text-[0.95em] leading-6 no-underline transition-colors"
    >
      {logo && !logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          className="size-3.5 shrink-0 rounded-sm"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <Link2 className="size-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </a>
  );
}

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  emptyState?: string;
}
function MarkdownPreview({
  content,
  className,
  emptyState,
}: MarkdownPreviewProps) {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return (
      <div className={cn("text-muted-foreground text-sm italic", className)}>
        {emptyState ?? "Your preview will appear here."}
      </div>
    );
  }

  return (
    <div className={cn("markdown-preview text-sm leading-7", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, href, children }) =>
            href ? <LinkChip href={href}>{children}</LinkChip> : children,
          p: ({ node: _node, ...props }) => (
            <p {...props} className="mb-2 last:mb-0" />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul {...props} className="mb-2 list-disc pl-5 last:mb-0" />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol {...props} className="mb-2 list-decimal pl-5 last:mb-0" />
          ),
          // [&>p]: "loose" lists wrap each item in <p>; keep them tight anyway
          li: ({ node: _node, ...props }) => (
            <li {...props} className="my-0.5 [&>p]:mb-0" />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              {...props}
              className="border-border text-muted-foreground my-2 border-l-2 pl-3 italic"
            />
          ),
          table: ({ node: _node, ...props }) => (
            <table
              {...props}
              className="border-border mb-4 w-full border-collapse border"
            />
          ),
          thead: ({ node: _node, ...props }) => (
            <thead {...props} className="bg-muted/50" />
          ),
          tbody: ({ node: _node, ...props }) => <tbody {...props} />,
          tr: ({ node: _node, ...props }) => (
            <tr {...props} className="border-border border-b" />
          ),
          td: ({ node: _node, ...props }) => (
            <td
              {...props}
              className="border-border border-r px-3 py-2 last:border-r-0"
            />
          ),
          th: ({ node: _node, ...props }) => (
            <th
              {...props}
              className="border-border border-r px-3 py-2 font-semibold last:border-r-0"
            />
          ),
          code: ({
            node: _node,
            className: codeClassName,
            children,
            ...props
          }) => {
            const isInline = !codeClassName;

            if (isInline) {
              return (
                <code
                  {...props}
                  className="bg-muted rounded px-1 py-0.5 font-mono text-[0.92em]"
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                {...props}
                className={cn(
                  "bg-muted block overflow-x-auto rounded-lg px-3 py-2 font-mono text-[0.9em]",
                  codeClassName,
                )}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}

export { MarkdownPreview };
