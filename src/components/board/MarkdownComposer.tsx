"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bold,
  Code2,
  CornerDownLeft,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Paperclip,
  Quote,
  Strikethrough,
  Table,
  Underline,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownPreview } from "./MarkdownPreview";
import TurndownService from "turndown";

const getKeyboardShortcuts = () => {
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";
  return {
    bold: `${mod}+B`,
    italic: `${mod}+I`,
    underline: `${mod}+U`,
    strikethrough: `${mod}+Shift+X`,
    link: `${mod}+K`,
    quote: `${mod}+Shift+.`,
    code: `${mod}+\``,
    list: `${mod}+Shift+8`,
    orderedList: `${mod}+Shift+7`,
    checklist: `${mod}+Shift+C`,
  };
};

interface MarkdownComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  submitDisabled?: boolean;
  onCancel?: () => void;
  onAttachImages?: () => void;
  imageCount?: number;
  showPreview?: boolean;
  previewOnly?: boolean;
  onToggleSource?: () => void;
  onStartWysiwyg?: () => void;
  wysiwygActive?: boolean;
  onCommitWysiwyg?: () => void;
  className?: string;
  children?: ReactNode;
}

export default function MarkdownComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  submitDisabled = false,
  onCancel,
  onAttachImages,
  imageCount = 0,
  showPreview = true,
  previewOnly = false,
  onToggleSource,
  onStartWysiwyg,
  wysiwygActive = false,
  onCommitWysiwyg,
  className,
  children,
}: MarkdownComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wysiwygRef = useRef<HTMLDivElement>(null);
  const [editorValue, setEditorValue] = useState(value);
  const [shortcuts] = useState(getKeyboardShortcuts());

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 150), 360);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 360 ? "auto" : "hidden";
  }, [editorValue]);

  const updateValue = (nextValue: string) => {
    setEditorValue(nextValue);
    onChange(nextValue);
  };

  const applyEditorEdit = (
    edit: (
      currentValue: string,
      selectionStart: number,
      selectionEnd: number,
    ) => {
      nextValue: string;
      nextSelectionStart?: number;
      nextSelectionEnd?: number;
    },
  ) => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const result = edit(editorValue, selectionStart, selectionEnd);

    updateValue(result.nextValue);

    requestAnimationFrame(() => {
      const activeTextarea = textareaRef.current;
      if (!activeTextarea) return;

      activeTextarea.focus();
      activeTextarea.setSelectionRange(
        result.nextSelectionStart ?? selectionStart,
        result.nextSelectionEnd ?? selectionEnd,
      );
    });
  };

  const wrapSelection = (
    prefix: string,
    suffix = prefix,
    fallback = "text",
  ) => {
    applyEditorEdit((currentValue, start, end) => {
      const selected = currentValue.slice(start, end);
      const content = selected || fallback;
      const wrapped = `${prefix}${content}${suffix}`;
      const nextValue = `${currentValue.slice(0, start)}${wrapped}${currentValue.slice(end)}`;

      if (selected) {
        return {
          nextValue,
          nextSelectionStart: start + prefix.length,
          nextSelectionEnd: start + prefix.length + selected.length,
        };
      }

      return {
        nextValue,
        nextSelectionStart: start + prefix.length,
        nextSelectionEnd: start + prefix.length + fallback.length,
      };
    });
  };

  const prefixSelectedLines = (prefixFactory: (index: number) => string) => {
    applyEditorEdit((currentValue, start, end) => {
      const lineStart =
        currentValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEnd = currentValue.indexOf("\n", end);
      const normalizedLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;

      const block = currentValue.slice(lineStart, normalizedLineEnd);
      const lines = block.split("\n");
      const nextBlock = lines
        .map((line, index) => {
          if (!line.trim()) return line;
          return `${prefixFactory(index)}${line}`;
        })
        .join("\n");

      const nextValue =
        currentValue.slice(0, lineStart) +
        nextBlock +
        currentValue.slice(normalizedLineEnd);

      return {
        nextValue,
        nextSelectionStart: lineStart,
        nextSelectionEnd: lineStart + nextBlock.length,
      };
    });
  };

  const addLink = () => {
    applyEditorEdit((currentValue, start, end) => {
      const selected = currentValue.slice(start, end);
      const label = selected || "link text";
      const link = `[${label}](https://)`;
      const nextValue = `${currentValue.slice(0, start)}${link}${currentValue.slice(end)}`;
      const urlStart = start + link.indexOf("https://");

      return {
        nextValue,
        nextSelectionStart: urlStart,
        nextSelectionEnd: urlStart + "https://".length,
      };
    });
  };

  const continueChecklistOnEnter = () => {
    applyEditorEdit((currentValue, start) => {
      const lineStart =
        currentValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEnd = currentValue.indexOf("\n", start);
      const normalizedLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
      const line = currentValue.slice(lineStart, normalizedLineEnd);

      const checklistMatch = line.match(/^(\s*[-*]\s+\[(?: |x|X)\]\s*)/);
      if (!checklistMatch) {
        return { nextValue: currentValue };
      }

      const indent = checklistMatch[1] ?? "";
      const nextValue = `${currentValue.slice(0, start)}\n${indent}${currentValue.slice(start)}`;

      return {
        nextValue,
        nextSelectionStart: start + 1 + indent.length,
        nextSelectionEnd: start + 1 + indent.length,
      };
    });
  };

  const toggleQuote = () => {
    applyEditorEdit((currentValue, start, end) => {
      const lineStart =
        currentValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEnd = currentValue.indexOf("\n", end);
      const normalizedLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;

      const selectedLines = currentValue.slice(lineStart, normalizedLineEnd);
      const lines = selectedLines.split("\n");

      // Check if all selected lines start with '>'
      const allQuoted = lines.every((line) => /^\s*>/.test(line));

      const processedLines = lines.map((line) => {
        if (allQuoted) {
          // Remove quote
          return line.replace(/^\s*>\s?/, "");
        } else {
          // Add quote
          return `> ${line}`;
        }
      });

      const nextBlock = processedLines.join("\n");
      const nextValue = `${currentValue.slice(0, lineStart)}${nextBlock}${currentValue.slice(normalizedLineEnd)}`;

      return {
        nextValue,
        nextSelectionStart: lineStart,
        nextSelectionEnd: lineStart + nextBlock.length,
      };
    });
  };

  const toggleCode = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editorValue.slice(start, end);

    let nextValue: string;
    let nextStart: number;
    let nextEnd: number;

    if (!selected) {
      // No selection - insert placeholder
      nextValue = `${editorValue.slice(0, start)}\`code\`${editorValue.slice(end)}`;
      nextStart = start + 1;
      nextEnd = start + 5;
    } else if (
      selected.startsWith("`") &&
      selected.endsWith("`") &&
      selected.length > 2
    ) {
      // Already wrapped - remove backticks
      const unwrapped = selected.slice(1, -1);
      nextValue = `${editorValue.slice(0, start)}${unwrapped}${editorValue.slice(end)}`;
      nextStart = start;
      nextEnd = start + unwrapped.length;
    } else {
      // Wrap with backticks
      const wrapped = `\`${selected}\``;
      nextValue = `${editorValue.slice(0, start)}${wrapped}${editorValue.slice(end)}`;
      nextStart = start;
      nextEnd = start + wrapped.length;
    }

    updateValue(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
    });
  };

  const insertTable = () => {
    applyEditorEdit((currentValue, start) => {
      const tableTemplate = `| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |`;

      const nextValue = `${currentValue.slice(0, start)}\n${tableTemplate}\n${currentValue.slice(start)}`;

      return {
        nextValue,
        nextSelectionStart: start + 1,
        nextSelectionEnd: start + 1 + tableTemplate.length,
      };
    });
  };

  const toggleBulletList = () => {
    applyEditorEdit((currentValue, start, end) => {
      const lineStart =
        currentValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEnd = currentValue.indexOf("\n", end);
      const normalizedLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;

      const selectedLines = currentValue.slice(lineStart, normalizedLineEnd);
      const lines = selectedLines.split("\n");

      // Check if all selected lines start with '- '
      const allBulleted = lines.every((line) => /^\s*[-*]\s/.test(line));

      const processedLines = lines.map((line) => {
        if (allBulleted) {
          // Remove bullet
          return line.replace(/^\s*[-*]\s/, "");
        } else {
          // Add bullet
          return `- ${line}`;
        }
      });

      const nextBlock = processedLines.join("\n");
      const nextValue = `${currentValue.slice(0, lineStart)}${nextBlock}${currentValue.slice(normalizedLineEnd)}`;

      return {
        nextValue,
        nextSelectionStart: lineStart,
        nextSelectionEnd: lineStart + nextBlock.length,
      };
    });
  };

  const toggleOrderedList = () => {
    applyEditorEdit((currentValue, start, end) => {
      const lineStart =
        currentValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEnd = currentValue.indexOf("\n", end);
      const normalizedLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;

      const selectedLines = currentValue.slice(lineStart, normalizedLineEnd);
      const lines = selectedLines.split("\n");

      // Check if all selected lines start with number followed by '.'
      const allNumbered = lines.every((line) => /^\s*\d+\.\s/.test(line));

      const processedLines = lines.map((line, index) => {
        if (allNumbered) {
          // Remove number
          return line.replace(/^\s*\d+\.\s/, "");
        } else {
          // Add number
          return `${index + 1}. ${line}`;
        }
      });

      const nextBlock = processedLines.join("\n");
      const nextValue = `${currentValue.slice(0, lineStart)}${nextBlock}${currentValue.slice(normalizedLineEnd)}`;

      return {
        nextValue,
        nextSelectionStart: lineStart,
        nextSelectionEnd: lineStart + nextBlock.length,
      };
    });
  };

  const toggleChecklist = () => {
    applyEditorEdit((currentValue, start, end) => {
      const lineStart =
        currentValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEnd = currentValue.indexOf("\n", end);
      const normalizedLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;

      const selectedLines = currentValue.slice(lineStart, normalizedLineEnd);
      const lines = selectedLines.split("\n");

      // Check if all selected lines start with checkbox
      const allCheckboxed = lines.every((line) =>
        /^\s*[-*]\s+\[(?: |x|X)\]\s/.test(line),
      );

      const processedLines = lines.map((line) => {
        if (allCheckboxed) {
          // Remove checkbox
          return line.replace(/^\s*[-*]\s+\[(?: |x|X)\]\s/, "");
        } else {
          // Add checkbox
          return `- [ ] ${line}`;
        }
      });

      const nextBlock = processedLines.join("\n");
      const nextValue = `${currentValue.slice(0, lineStart)}${nextBlock}${currentValue.slice(normalizedLineEnd)}`;

      return {
        nextValue,
        nextSelectionStart: lineStart,
        nextSelectionEnd: lineStart + nextBlock.length,
      };
    });
  };

  const turndown = new TurndownService();

  const startWysiwyg = () => {
    onStartWysiwyg?.();
    requestAnimationFrame(() => {
      const el = wysiwygRef.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  };

  const commitWysiwyg = () => {
    const el = wysiwygRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const md = turndown.turndown(html);
    updateValue(md);
    onCommitWysiwyg?.();
  };

  const wysiwygHtml = renderToStaticMarkup(
    <MarkdownPreview content={editorValue} className="text-foreground" />,
  );

  const handleFormat = (command: string) => {
    if (wysiwygActive) {
      wysiwygRef.current?.focus();
      document.execCommand(command, false);
      wysiwygRef.current?.focus();
    } else {
      wrapSelection("**", "**", "text");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "enter"
    ) {
      event.preventDefault();
      if (!submitDisabled && !disabled) {
        if (wysiwygActive) {
          commitWysiwyg();
          requestAnimationFrame(() => onSubmit());
          return;
        }
        onSubmit();
      }
      return;
    }

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.ctrlKey
    ) {
      const textarea = textareaRef.current;
      if (!textarea || disabled) return;

      const selectionStart = textarea.selectionStart;
      const lineStart =
        editorValue.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
      const lineEnd = editorValue.indexOf("\n", selectionStart);
      const normalizedLineEnd = lineEnd === -1 ? editorValue.length : lineEnd;
      const line = editorValue.slice(lineStart, normalizedLineEnd);

      if (/^\s*[-*]\s+\[(?: |x|X)\]\s*/.test(line)) {
        event.preventDefault();
        continueChecklistOnEnter();
      }
    }
  };

  return (
    <div
      className={cn(
        "border-border/70 from-background via-background to-muted/20 focus-within:border-primary/20 overflow-hidden rounded-lg border bg-linear-to-b shadow-[0_18px_50px_-28px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-shadow focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_18px_50px_-28px_rgba(0,0,0,0.28)]",
        className,
      )}
    >
      <div className="space-y-1 p-1">
        <div className="border-border/70 bg-muted/25 flex flex-wrap items-center gap-1 rounded-md border p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("bold")
                : wrapSelection("**", "**", "bold");
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Bold"
            title={`Bold (${shortcuts.bold})`}
          >
            <Bold className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("italic")
                : wrapSelection("*", "*", "italic");
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Italic"
            title={`Italic (${shortcuts.italic})`}
          >
            <Italic className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("underline")
                : wrapSelection("<u>", "</u>", "underline");
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Underline"
            title={`Underline (${shortcuts.underline})`}
          >
            <Underline className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("strikethrough")
                : wrapSelection("~~", "~~", "strike");
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Strikethrough"
            title={`Strikethrough (${shortcuts.strikethrough})`}
          >
            <Strikethrough className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              insertTable();
            }}
            disabled={disabled}
            aria-label="Table"
            title="Insert table"
          >
            <Table className="size-3.5" />
          </Button>
          <div className="bg-border mx-1 h-5 w-px" />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("createLink", false, "https://")
                : addLink();
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Link"
            title={`Link (${shortcuts.link})`}
          >
            <Link2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("formatBlock", false, "<blockquote>")
                : toggleQuote();
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Quote"
            title={`Quote (${shortcuts.quote})`}
          >
            <Quote className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("formatBlock", false, "<code>")
                : toggleCode();
            }}
            disabled={disabled}
            aria-label="Inline code"
            title={`Code (${shortcuts.code})`}
          >
            <Code2 className="size-3.5" />
          </Button>
          <div className="bg-border mx-1 h-5 w-px" />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("insertUnorderedList")
                : toggleBulletList();
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Bulleted list"
            title={`List (${shortcuts.list})`}
          >
            <List className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("insertOrderedList")
                : toggleOrderedList();
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Numbered list"
            title={`Ordered list (${shortcuts.orderedList})`}
          >
            <ListOrdered className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onMouseDown={(e) => {
              e.preventDefault();
              wysiwygActive
                ? document.execCommand("insertUnorderedList")
                : toggleChecklist();
              wysiwygRef.current?.focus();
            }}
            disabled={disabled}
            aria-label="Checklist"
            title={`Checklist (${shortcuts.checklist})`}
          >
            <ListChecks className="size-3.5" />
          </Button>
        </div>

        {!previewOnly && !wysiwygActive && (
          <Textarea
            ref={textareaRef}
            value={editorValue}
            onChange={(event) => updateValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus
            className={cn(
              "border-border/70 bg-background/90 placeholder:text-muted-foreground/60 focus-visible:border-primary/20 min-h-[150px] resize-none border px-4 py-3 text-[15px] leading-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-xl transition-all outline-none focus-visible:ring-0",
              disabled && "cursor-not-allowed opacity-60",
            )}
          />
        )}
        {previewOnly && !wysiwygActive && (
          <div className="space-y-2">
            <div className="text-muted-foreground mb-2 text-[11px] font-medium tracking-wide uppercase">
              Preview
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={startWysiwyg}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  startWysiwyg();
                }
              }}
              className="border-border/70 bg-muted/20 hover:border-primary/30 cursor-pointer rounded-md border px-4 py-3 transition-colors"
            >
              <MarkdownPreview
                content={editorValue}
                className="text-foreground"
              />
            </div>
          </div>
        )}
        {previewOnly && wysiwygActive && (
          <div className="space-y-2">
            <div
              ref={wysiwygRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={() => commitWysiwyg()}
              className="border-border/70 bg-background/90 focus:border-primary/20 min-h-[150px] cursor-text overflow-auto rounded-md border px-4 py-3 text-[15px] leading-7 outline-none"
              dangerouslySetInnerHTML={{ __html: wysiwygHtml }}
            />
          </div>
        )}
        {children}
      </div>

      <div className="border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {onAttachImages && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onAttachImages}
              disabled={disabled}
              className="text-muted-foreground hover:border-primary/10 hover:bg-primary/8 hover:text-foreground h-8 gap-1.5 rounded-full border border-transparent px-2.5 text-xs"
            >
              <Paperclip className="size-3.5" />
              Add images
            </Button>
          )}
          {imageCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {imageCount} image{imageCount > 1 ? "s" : ""} attached
            </span>
          )}
          <span className="text-muted-foreground hidden text-xs md:inline">
            Use <span className="font-medium">⌘/Ctrl + Enter</span> to send
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onCancel}
              disabled={disabled}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (wysiwygActive) {
                commitWysiwyg();
                requestAnimationFrame(() => onSubmit());
                return;
              }
              onSubmit();
            }}
            disabled={disabled || submitDisabled}
            className="h-8 w-8 p-0"
            title="Send"
          >
            <CornerDownLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
