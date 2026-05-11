"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          a: ({ node: _node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary decoration-primary/40 hover:decoration-primary underline underline-offset-4"
            />
          ),
          p: ({ node: _node, ...props }) => (
            <p {...props} className="mb-2 last:mb-0" />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul {...props} className="mb-2 list-disc pl-5 last:mb-0" />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol {...props} className="mb-2 list-decimal pl-5 last:mb-0" />
          ),
          li: ({ node: _node, ...props }) => (
            <li {...props} className="my-0.5" />
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
