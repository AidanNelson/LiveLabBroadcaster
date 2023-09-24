import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

import {myFiles} from "./defaultP5Sketch";

// const p5SketchDefault = `
// function setup(){
//     createCanvas(windowWidth,windowHeight);
//     clear();
//     fill(random(0,200),random(0,200),random(0,200));
//     rect(50,50,50,50);
// }`;

export const ScriptEditor = ({ socket }) => {
  const frameRef = useRef();
  const editorRef = useRef();
  const [editorVisible, setEditorVisible] = useState(true);
  const [valueFromDB, setValueFromDB] = useState(false);

  const [fileName, setFileName] = useState('script.js');
  const [localFileValues, setLocalFileValues] = useState(myFiles);
  const file = myFiles[fileName];

  const toggleEditorVisibility = () => {
    console.log('toggling');
    setEditorVisible(!editorVisible);
  };

  const updateLocalValues = () => {
    const val = editorRef.current.getModel().getValue(2);
    console.log('current file: ',file);
    console.log('current value:',val);
    file.value = val;
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
    // console.log(editorRef.current);
    // const editorContents = editorRef.current.getModel().getValue(2);
    // console.log("update:", editorContents);
    // const head = `
    // <!DOCTYPE html>
    // <html lang="en">
    // <head>
    //   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.js"></script>
    //   <meta charset="utf-8" />
    //   <style>
    //     html,
    //     body {
    //       margin: 0px;
    //       padding: 0px;
    //       overflow: hidden;
    //     }
    //   </style>
    // </head>`;
    // const body = `<body>
    // <script type="text/javascript">
        
    //     ${editorContents}
    // </script>
    // </body>
    // </html>`;
    // const htmlString = "data:text/html," + head + body;
    // frameRef.current.src = htmlString;
    // window.localStorage.setItem("scriptableObject", editorContents);
    // if (socket?.connected) {
    //   socket.emit("scriptUpdate", {
    //     script: editorContents,
    //   });
    // }

    // https://dev.to/pulljosh/how-to-load-html-css-and-js-code-into-an-iframe-2blc

    const getGeneratedPageURL = ({ html, css, js }) => {
      const getBlobURL = (code, type) => {
        const blob = new Blob([code], { type })
        return URL.createObjectURL(blob)
      }
    
      const cssURL = getBlobURL(css, 'text/css')
      const jsURL = getBlobURL(js, 'text/javascript')
    
      const source = `
        <html>
          <head>
            ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
            ${js && `<script src="${jsURL}"></script>`}
          </head>
          <body>
            ${html || ''}
          </body>
        </html>
      `
    
      return getBlobURL(source, 'text/html')
    }
    
    const url = getGeneratedPageURL({
      html: myFiles['index.html'].value,
      css: myFiles['style.css'].value,
      js:myFiles['script.js'].value
    })
    frameRef.current.src = url;
    // const iframe = document.querySelector('#iframe')
    // iframe.src = url
    
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
        <button disabled={fileName === 'script.js'} onClick={() => setFileName('script.js')}>
        script.js
      </button>
      <button disabled={fileName === 'style.css'} onClick={() => setFileName('style.css')}>
        style.css
      </button>
      <button disabled={fileName === 'index.html'} onClick={() => setFileName('index.html')}>
        index.html
      </button>
        <Editor
          onMount={handleEditorDidMount}
          height="100%"
          width="100%"
          path={file.name}
          defaultLanguage={file.language}
          defaultValue={file.value}
          onChange={updateLocalValues}
          onValidate={(ev) => {
            console.log("validated");
          }}
        />
      </div>
    </>
  );
};
