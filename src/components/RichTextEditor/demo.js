"use client";

import React, { useState } from "react";
import RichTextEditor from "./index";
import { MarkdownTypography } from "../MarkdownTypography";

const RichTextEditorDemo = () => {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  const handleSave = async () => {
    // Simulate saving to database
    console.log("Saving Markdown content:", content);
    setSavedContent(content);
    alert("Markdown content saved!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tiptap Rich Text Editor Demo</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Editor</h2>
        <RichTextEditor
          value={content}
          onChange={setContent}
          onSave={handleSave}
          placeholder="Start typing your content here..."
          className="w-full border border-border rounded-md overflow-hidden"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Raw Markdown Output</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {content || "No content yet..."}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Rendered Content (with Typography styles)</h2>
        <div className="border p-4 rounded min-h-[100px]">
          <MarkdownTypography>{content}</MarkdownTypography>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Last Saved Content</h2>
        <div className="border p-4 rounded min-h-[100px] bg-green-50">
          <MarkdownTypography>{savedContent}</MarkdownTypography>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditorDemo;
