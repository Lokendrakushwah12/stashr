"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "@tiptap/extension-image";
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
import { useEffect, useRef, useState } from "react";

interface MarkdownComposerProps {
  /** Markdown in and out; the editor itself is WYSIWYG. */
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  submitDisabled?: boolean;
  onCancel?: () => void;
  /** Uploads images and returns their URLs; enables paste, drop and attach. */
  onUploadImages?: (files: File[]) => Promise<string[]>;
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
  "[&_img]:my-2 [&_img]:max-h-80 [&_img]:rounded-lg [&_img.ProseMirror-selectednode]:ring-primary [&_img.ProseMirror-selectednode]:ring-2",
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
  onUploadImages,
  className,
  children,
}: MarkdownComposerProps) {
  // Refs so the editor (created once) always calls the latest handlers.
  const [uploading, setUploading] = useState(0);
  const submitRef = useRef<() => void>(() => undefined);
  submitRef.current = () => {
    if (!disabled && !submitDisabled && !uploading) onSubmit();
  };
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploads images and drops them in where they were pasted/dropped/picked.
  const insertImagesRef = useRef<
    (files: Iterable<File>, pos?: number) => boolean
  >(() => false);
  insertImagesRef.current = (files, pos) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!onUploadImages || images.length === 0) return false;
    setUploading((n) => n + 1);
    onUploadImages(images)
      .then((urls) => {
        const nodes = urls.map((src) => ({ type: "image", attrs: { src } }));
        if (!editor || nodes.length === 0) return;
        const at = pos ?? editor.state.selection.to;
        editor.chain().focus().insertContentAt(at, nodes).run();
      })
      .catch(() => undefined) // the uploader reports its own errors
      .finally(() => setUploading((n) => n - 1));
    return true;
  };

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
      Image,
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
    editorProps: {
      attributes: { class: CONTENT_CLASS },
      handlePaste: (_view, event) =>
        insertImagesRef.current(event.clipboardData?.files ?? []),
      handleDrop: (view, event, _slice, moved) =>
        !moved &&
        insertImagesRef.current(
          event.dataTransfer?.files ?? [],
          view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos,
        ),
    },
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
      data-note
      data-mine
      className={cn(
        "border-border/70 focus-within:border-primary/30 overflow-hidden rounded-xl border transition-colors",
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
          {onUploadImages && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) insertImagesRef.current(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading > 0}
                className="text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-full px-2.5 text-xs"
              >
                <Paperclip
                  className={cn("size-3.5", uploading > 0 && "animate-pulse")}
                />
                {uploading > 0 ? "Uploading image…" : "Add images"}
              </Button>
            </>
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
            disabled={disabled || submitDisabled || uploading > 0}
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
