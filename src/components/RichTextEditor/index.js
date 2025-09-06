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
import { MarkdownTypography } from "../MarkdownTypography";

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
        isActive={editor.isActive("heading", { level: 6 })}
        disabled={editor.isActive("heading", { level: 6 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
      >
        XS
      </ToggleButton>
      <ToggleButton
        isActive={editor.isActive("paragraph")}
        disabled={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        SM
      </ToggleButton>
      <ToggleButton
        isActive={editor.isActive("heading", { level: 4 })}
        disabled={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        MD
      </ToggleButton>
      <ToggleButton
        isActive={editor.isActive("heading", { level: 3 })}
        disabled={editor.isActive("heading", { level: 3 })}
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
    if (!markdown || typeof markdown !== 'string') return content;
    
    // Split into lines for better processing
    const lines = String(markdown).split('\n');
    let html = '';
    let inList = false;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Headers
      if (line.match(/^#{1,6} /)) {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = '';
        }
        const level = line.match(/^(#{1,6})/)[1].length;
        const text = line.replace(/^#{1,6} /, '');
        html += `<h${level}>${text}</h${level}>`;
      }
      // Unordered list items
      else if (line.match(/^[\-\*] /)) {
        if (!inList || listType !== 'ul') {
          if (inList) html += `</${listType}>`;
          html += '<ul>';
          inList = true;
          listType = 'ul';
        }
        const text = line.replace(/^[\-\*] /, '');
        html += `<li>${text}</li>`;
      }
      // Ordered list items
      else if (line.match(/^\d+\. /)) {
        if (!inList || listType !== 'ol') {
          if (inList) html += `</${listType}>`;
          html += '<ol>';
          inList = true;
          listType = 'ol';
        }
        const text = line.replace(/^\d+\. /, '');
        html += `<li>${text}</li>`;
      }
      // Empty line - skip adding <br> tags to prevent newline accumulation
      else if (line === '') {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = '';
        }
        // Skip empty lines to prevent newline accumulation on refresh
      }
      // Regular paragraph text
      else {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = '';
        }
        
        // Process inline formatting
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>');
        
        html += `<p>${processedLine}</p>`;
      }
    }
    
    // Close any open list
    if (inList) {
      html += `</${listType}>`;
    }
    
    return html;
  };

  return (
    <div className={`${styles.richTextEditor} ${className} border border-border rounded-md`} {...props}>
      <EditorProvider
        slotBefore={<MenuBar onSave={onSave} />}
        extensions={extensions}
        content={value ? getHtmlFromMarkdown(value) : ``}
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
