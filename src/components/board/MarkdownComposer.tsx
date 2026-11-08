"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import {
  EditorContent,
  Extension,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
import { useEffect, useRef } from "react";

interface MarkdownComposerProps {
  /** Markdown in and out; the editor itself is WYSIWYG. */
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  submitDisabled?: boolean;
  onCancel?: () => void;
  onAttachImages?: () => void;
  imageCount?: number;
  className?: string;
  children?: ReactNode;
}

// Styles for the rendered document inside the editor (Tailwind preflight
// strips list markers, quote borders, etc.).
const CONTENT_CLASS = cn(
  "min-h-[120px] max-h-[360px] overflow-y-auto px-4 py-3 text-[15px] leading-7 outline-none",
  "[&_p]:my-0 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li>p]:my-0",
  "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-1",
  "[&_ul[data-type=taskList]>li]:flex [&_ul[data-type=taskList]>li]:items-start [&_ul[data-type=taskList]>li]:gap-2",
  "[&_ul[data-type=taskList]>li>label]:mt-1 [&_ul[data-type=taskList]>li>div]:flex-1",
  "[&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic",
  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em]",
  "[&_pre]:bg-muted [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:px-3 [&_pre]:py-2",
  "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1",
  "[&_p.is-editor-empty:first-child]:before:text-muted-foreground/60 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
);

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
  className,
  children,
}: MarkdownComposerProps) {
  // Refs so the editor (created once) always calls the latest handlers.
  const submitRef = useRef<() => void>(() => undefined);
  submitRef.current = () => {
    if (!disabled && !submitDisabled) onSubmit();
  };
  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false, // SSR-safe
    editable: !disabled,
    content: value,
    contentType: "markdown",
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
      Markdown,
      // Mod-Enter sends. Runs before HardBreak, which also binds Mod-Enter;
      // Shift-Enter still inserts a line break, Enter a new paragraph/item.
      Extension.create({
        name: "submitShortcut",
        priority: 1000,
        addKeyboardShortcuts: () => ({
          "Mod-Enter": () => {
            submitRef.current();
            return true;
          },
        }),
      }),
    ],
    editorProps: { attributes: { class: CONTENT_CLASS } },
    onUpdate: ({ editor: e }) => changeRef.current(e.getMarkdown()),
  });

  // Follow outside changes (e.g. cleared after sending) without echoing back.
  useEffect(() => {
    if (!editor || editor.getMarkdown() === value) return;
    editor.commands.setContent(value, {
      contentType: "markdown",
      emitUpdate: false,
    });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      strike: e?.isActive("strike") ?? false,
      link: e?.isActive("link") ?? false,
      blockquote: e?.isActive("blockquote") ?? false,
      code: e?.isActive("code") ?? false,
      bulletList: e?.isActive("bulletList") ?? false,
      orderedList: e?.isActive("orderedList") ?? false,
      taskList: e?.isActive("taskList") ?? false,
    }),
  });

  const toggleLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = window.prompt("Link URL", "https://");
    if (!href || href === "https://") return;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const tools: Array<
    | "divider"
    | {
        label: string;
        icon: typeof Bold;
        run: () => void;
        isActive?: boolean;
      }
  > = editor
    ? [
        {
          label: "Bold",
          icon: Bold,
          run: () => editor.chain().focus().toggleBold().run(),
          isActive: active?.bold,
        },
        {
          label: "Italic",
          icon: Italic,
          run: () => editor.chain().focus().toggleItalic().run(),
          isActive: active?.italic,
        },
        {
          label: "Underline",
          icon: Underline,
          run: () => editor.chain().focus().toggleUnderline().run(),
          isActive: active?.underline,
        },
        {
          label: "Strikethrough",
          icon: Strikethrough,
          run: () => editor.chain().focus().toggleStrike().run(),
          isActive: active?.strike,
        },
        {
          label: "Table",
          icon: Table,
          run: () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
        },
        "divider",
        {
          label: "Link",
          icon: Link2,
          run: toggleLink,
          isActive: active?.link,
        },
        {
          label: "Quote",
          icon: Quote,
          run: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: active?.blockquote,
        },
        {
          label: "Inline code",
          icon: Code2,
          run: () => editor.chain().focus().toggleCode().run(),
          isActive: active?.code,
        },
        "divider",
        {
          label: "Bulleted list",
          icon: List,
          run: () => editor.chain().focus().toggleBulletList().run(),
          isActive: active?.bulletList,
        },
        {
          label: "Numbered list",
          icon: ListOrdered,
          run: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: active?.orderedList,
        },
        {
          label: "Checklist",
          icon: ListChecks,
          run: () => editor.chain().focus().toggleTaskList().run(),
          isActive: active?.taskList,
        },
      ]
    : [];

  return (
    <div
      className={cn(
        "border-border/70 dark:bg-background focus-within:border-primary/30 overflow-hidden rounded-xl border bg-white transition-colors",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="border-border/60 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1">
        {tools.map((tool, i) =>
          tool === "divider" ? (
            <div key={`d${i}`} className="bg-border mx-1 h-4 w-px" />
          ) : (
            <Button
              key={tool.label}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "text-muted-foreground h-7 w-7 p-0",
                tool.isActive && "bg-muted text-foreground",
              )}
              // keep the editor's selection when clicking a tool
              onMouseDown={(e) => e.preventDefault()}
              onClick={tool.run}
              disabled={disabled}
              aria-label={tool.label}
              aria-pressed={tool.isActive}
              title={tool.label}
            >
              <tool.icon className="size-3.5" />
            </Button>
          ),
        )}
      </div>

      <EditorContent editor={editor} />

      {children && <div className="px-3 pb-2">{children}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {onAttachImages && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onAttachImages}
              disabled={disabled}
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-full px-2.5 text-xs"
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
            <span className="font-medium">Shift + Enter</span> new line ·{" "}
            <span className="font-medium">⌘/Ctrl + Enter</span> send
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
            onClick={() => submitRef.current()}
            disabled={disabled || submitDisabled}
            className="h-8 w-8 rounded-full p-0"
            title="Send (⌘/Ctrl + Enter)"
          >
            <CornerDownLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
