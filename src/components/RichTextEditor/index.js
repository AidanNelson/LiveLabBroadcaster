import styles from "./RichTextEditor.module.css";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { Button } from "../ui/button";
import { ToggleButton } from "../ToggleButton";
import { Separator } from "../ui/separator";
import TurndownService from "turndown";

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-primary flex-wrap">
      <ToggleButton
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToggleButton>
      <ToggleButton
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToggleButton>
      <div className="h-6 w-px bg-secondary/60" />
      <ToggleButton
        isActive={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        SM
      </ToggleButton>
      <ToggleButton
        isActive={editor.isActive("heading", { level: 6 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
      >
        MD
      </ToggleButton>
      <ToggleButton
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        LG
      </ToggleButton>
    </div>
  );
};

// Initialize Turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  bulletListMarker: '-', // Use - for bullet lists
  codeBlockStyle: 'fenced', // Use ``` for code blocks
});

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
];

const content = ``;

export const RichTextEditor = ({
  value = "",
  onChange,
  onSave,
  placeholder = "Start typing...",
  className,
  ...props
}) => {
  const handleUpdate = ({ editor }) => {
    if (onChange) {
      const html = editor.getHTML();
      // Convert HTML to Markdown for storage
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    }
  };

  // Convert Markdown to HTML for editing
  const getHtmlFromMarkdown = (markdown) => {
    if (!markdown) return content;
    
    // Enhanced Markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.includes('<h') && !html.includes('<li')) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  };

  return (
    <div className={`${styles.richTextEditor} ${className}`} {...props}>
      <EditorProvider
        slotBefore={<MenuBar onSave={onSave} />}
        extensions={extensions}
        content={value ? getHtmlFromMarkdown(value) : content}
        onUpdate={handleUpdate}
        immediatelyRender={false}
        editorProps={{
          attributes: {
            class: "focus:outline-none p-3 min-h-[200px]",
            style: "min-height: 200px;",
          },
        }}
      />
    </div>
  );
};

export default RichTextEditor;
