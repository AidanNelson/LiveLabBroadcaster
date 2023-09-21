import Editor from "@monaco-editor/react";
import { useRef } from "react";

const p5SketchDefault = `
function setup(){
    createCanvas(windowWidth,windowHeight);
    background(random(0,200),random(0,200),random(0,200));
}`

export const ScriptEditor = () => {
  const frameRef = useRef();
  const unsafeEval = (editorContents) => {
    console.log("update:",editorContents);
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
    <div>
      <iframe ref={frameRef} />
      <Editor
        height="100vh"
        width="50%"
        defaultLanguage="javascript"
        defaultValue={p5SketchDefault}
        onChange={unsafeEval}
        onValidate={(ev) => {
          console.log("validated");
        }}
      />
    </div>
  );
};
