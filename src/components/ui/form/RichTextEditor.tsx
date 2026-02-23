"use client";

import { Extension } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FaAlignLeft, FaBold, FaItalic } from "react-icons/fa";
import { FaAlignCenter, FaAlignRight, FaUnderline } from "react-icons/fa6";
import { Button } from "@/app/components/ui/form/button";
import { Separator } from "@/app/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const colors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#808080",
  "#ffa500",
  "#a52a2a",
  "#8a2be2",
  "#deb887",
  "#5f9ea0",
  "#7fff00",
  "#d2691e",
  "#ff7f50",
  "#6495ed",
  "#fff8dc",
  "#dc143c",
  "#00008b",
  "#008b8b",
  "#b8860b",
  "#a9a9a9",
  "#006400",
  "#bdb76b",
  "#8b008b",
  "#556b2f",
  "#ff8c00",
  "#9932cc",
  "#8b0000",
  "#e9967a",
];

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const normalizeEmptyParagraphs = (html: string) =>
    html.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "<p><br></p>");

  const TrimTrailingSpaceOnEnter = Extension.create({
    name: "trimTrailingSpaceOnEnter",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          try {
            const { state, dispatch } = this.editor.view;
            const { selection } = state;
            const $from = selection.$from;
            if (!selection.empty) return false;
            const start = $from.start();
            const pos = $from.pos;
            const textBefore = state.doc.textBetween(start, pos, "", "");
            const lastChar = textBefore.slice(-1);
            if (lastChar === " " || lastChar === "\u00A0") {
              const tr = state.tr.delete(pos - 1, pos);
              dispatch(tr.scrollIntoView());
              // Perform default split/block behavior
              // Use commands.splitBlock() to mimic Enter
              // `this.editor` is available and has commands
              // Delay call to ensure transaction applied
              this.editor.commands.splitBlock();
              return true;
            }
          } catch (_e) {
            // If anything goes wrong, let default Enter behavior run
            return false;
          }
          return false;
        },
      };
    },
  });
  const editor = useEditor({
    extensions: [
      StarterKit,
      TrimTrailingSpaceOnEnter,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(normalizeEmptyParagraphs(editor.getHTML()));
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-md">
      <div className="flex flex-wrap gap-1 bg-neutral-300 p-2 dark:bg-neutral-600">
        {/* Align */}
        <Button
          type="button"
          title="Align left"
          variant={
            editor.isActive({ textAlign: "left" }) ? "default" : "outline"
          }
          size="sm"
          className="cursor-pointer border-neutral-400 bg-neutral-400 text-white hover:bg-neutral-500 dark:bg-neutral-600"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <FaAlignLeft />
        </Button>
        <Button
          type="button"
          title="Align center"
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "outline"
          }
          size="sm"
          className="cursor-pointer border-neutral-400 bg-neutral-400 text-white hover:bg-neutral-500 dark:bg-neutral-600"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <FaAlignCenter />
        </Button>
        <Button
          type="button"
          title="Align right"
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "outline"
          }
          size="sm"
          className="cursor-pointer border-neutral-400 bg-neutral-400 text-white hover:bg-neutral-500 dark:bg-neutral-600"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <FaAlignRight />
        </Button>

        <Separator orientation="vertical" className="h-6 w-6" />
        {/* Styling font */}
        <Button
          type="button"
          title="Bold text"
          variant={editor.isActive("bold") ? "default" : "outline"}
          className="cursor-pointer border-neutral-400 bg-neutral-400 text-white hover:bg-neutral-500 dark:bg-neutral-600"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FaBold />
        </Button>
        <Button
          type="button"
          title="Italic text"
          variant={editor.isActive("italic") ? "default" : "outline"}
          size="sm"
          className="cursor-pointer border-neutral-400 bg-neutral-400 text-white hover:bg-neutral-500 dark:bg-neutral-600"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FaItalic />
        </Button>
        <Button
          type="button"
          title="Underline text"
          variant={editor.isActive("underline") ? "default" : "outline"}
          className="cursor-pointer border-neutral-400 bg-neutral-400 text-white hover:bg-neutral-500 dark:bg-neutral-600"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FaUnderline />
        </Button>
        <Separator orientation="vertical" className="h-6 w-6" />
        {/* Change color of font */}
        <select
          className="rounded border border-neutral-400 px-2 py-1 text-sm"
          defaultValue={""}
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        >
          <option value="" disabled hidden>
            Color
          </option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert min-h-50 max-w-none rounded-b-md border-r-2 border-b-2 border-l-2 border-neutral-300 bg-neutral-200 p-4 text-sm outline-none sm:text-base dark:border-neutral-600 dark:bg-neutral-500"
        rows={15}
        cols={15}
      />
    </div>
  );
}
