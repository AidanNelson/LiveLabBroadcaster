import React, { useRef, useState } from "react";
import Editor from "./Editor";
import Quill from "quill";

const Delta = Quill.import("delta");

export const RichTextEditor = () => {
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [readOnly, setReadOnly] = useState(false);

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  return (
    <div>
      <Editor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={new Delta()
          .insert("Presented by")
          .insert("\n", { header: 3 })
          .insert("CultureHub")
          .insert("\n", { header: 2 })
          .insert("In Association With")
          .insert("\n", { header: 3 })
          .insert("Another Organization")
          .insert("\n", { header: 2 })
          .insert("\n")}
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />
      <div>
        <button>Save</button>
      </div>
    </div>
  );
};
