import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

const p5SketchDefault = `
function setup(){
    createCanvas(windowWidth,windowHeight);
    clear();
    fill(random(0,200),random(0,200),random(0,200));
    rect(50,50,50,50);
}`;

export const ScriptEditor = ({ socket }) => {
  const frameRef = useRef();
  const editorRef = useRef();
  const [editorVisible, setEditorVisible] = useState(true);
  const [valueFromDB, setValueFromDB] = useState(false);

  const toggleEditorVisibility = () => {
    console.log('toggling');
    setEditorVisible(!editorVisible);
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    refreshFrameSource();
    updateFrameVariables();
  }

  const updateFrameVariables = () => {
    frameRef.current.contentWindow.numberValue = Date.now();
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("script", (data) => {
      console.log("got script from database", data);
      setValueFromDB(data.data[0].script);
    });
  }, [socket]);

  const refreshFrameSource = () => {
    console.log(editorRef.current);
    const editorContents = editorRef.current.getModel().getValue(2);
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
    const htmlString = "data:text/html," + head + body;
    frameRef.current.src = htmlString;
    window.localStorage.setItem("scriptableObject", editorContents);
    if (socket?.connected) {
      socket.emit("scriptUpdate", {
        script: editorContents,
      });
    }
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
        <button onClick={toggleEditorVisibility}>Show/Hide Editor</button>
        <iframe
          ref={frameRef}
          style={{ border: `none`, width: `100%`, height: `100%` }}
        />
      </div>

      <div
        style={{
          position: `absolute`,
          top: `0px`,
          left: `50%`,
          width: `50vw`,
          height: `100vw`,
          display: editorVisible ? `block` : `none`,
        }}
      >
        <button onClick={refreshFrameSource}>Refresh</button>

        <Editor
          onMount={handleEditorDidMount}
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          defaultValue={
            valueFromDB? valueFromDB
              : p5SketchDefault
          }
          // onChange={unsafeEval}
          onValidate={(ev) => {
            console.log("validated");
          }}
        />
      </div>
    </>
  );
};
