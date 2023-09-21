import Editor from "@monaco-editor/react";
import { useRef } from "react";

const p5SketchDefault = `
function setup(){
    createCanvas(windowWidth,windowHeight);
    background(random(0,200),random(0,200),random(0,200));
}`;

export const ScriptEditor = () => {
  const frameRef = useRef();
  const editorRef = useRef();

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const refreshFrameSource = () => {
    console.log(editorRef.current);
    const editorContents = editorRef.current.getModel().getValue();
    console.log("update:", editorContents);
    const head = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.js"></script>
      <meta charset="utf-8" />
      <style>
        html,
        body {
          margin: 0px;
          padding: 0px;
          overflow: hidden;
        }
      </style>
    </head>`;
    const body = `<body>
    <script type="text/javascript">
        
        ${editorContents}
    </script>
    </body>
    </html>`;
    const htmlString = head + body;
    frameRef.current.src = "data:text/html," + htmlString;
    // eval(editorContents);
  };

  return (
    <>
      <div
        style={{
          position: `absolute`,
          top: `0px`,
          left: `0px`,
          width: `50vw`,
          height: `100vw`,
        }}
      >
        <iframe ref={frameRef} style={{ border: `none`, width: `100%`, height: `100%` }} />
      </div>
      <div
        style={{
          position: `absolute`,
          top: `0px`,
          left: `50%`,
          width: `50vw`,
          height: `100vw`,
        }}
      >
        <button onClick={refreshFrameSource}>Refresh</button>
        <Editor
          onMount={handleEditorDidMount}
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          defaultValue={p5SketchDefault}
          // onChange={unsafeEval}
          onValidate={(ev) => {
            console.log("validated");
          }}
        />
      </div>
    </>
  );
};
