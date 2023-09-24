import Editor from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { myFiles } from "./defaultP5Sketch";

const getGeneratedPageURL = ({ html, css, js }) => {
  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
  };

  const cssURL = getBlobURL(css, "text/css");
  const jsURL = getBlobURL(js, "text/javascript");

  const source = `
    <html>
      <head>
        ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
        ${js && `<script src="${jsURL}"></script>`}
      </head>
      <body>
        ${html || ""}
      </body>
    </html>
  `;
  return getBlobURL(source, "text/html");
};

export const ScriptableObject = ({ scriptableObjectData }) => {
  const frameRef = useRef();

  useEffect(() => {
    // https://dev.to/pulljosh/how-to-load-html-css-and-js-code-into-an-iframe-2blc
    const url = getGeneratedPageURL({
      html: scriptableObjectData.data["html"].value,
      css: scriptableObjectData.data["css"].value,
      js: scriptableObjectData.data["js"].value,
    });
    frameRef.current.src = url;
  },[scriptableObjectData]);

  return (
    <iframe
      ref={frameRef}
      style={{ border: `none`, width: `100%`, height: `100%` }}
    />
  );
};

export const ScriptEditor = ({ socket, venueId, scriptableObjectData }) => {
  // const frameRef = useRef();
  const editorRef = useRef();
  const [editorVisible, setEditorVisible] = useState(true);

  const [fileType, setfileType] = useState("js");
  const file = scriptableObjectData.data[fileType];

  const toggleEditorVisibility = () => {
    console.log("toggling");
    setEditorVisible(!editorVisible);
  };

  const updateLocalValues = () => {
    const val = editorRef.current.getModel().getValue(2);
    console.log("current file: ", file);
    console.log("current value:", val);
    file.value = val;
  };

  const saveToDb = useCallback(() => {
    if (!socket) return;
    const dataToSave = {
      type: "scriptableObject",
      _id: "12345",
      venueId: venueId,
      data: {
        js: scriptableObjectData.data["js"],
        css: scriptableObjectData.data["css"],
        html: scriptableObjectData.data["html"],
      },
    };
    console.log("emitting!", dataToSave);
    socket.emit("updateFeature", dataToSave);
  }, [socket]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // refreshFrameSource();
    // updateFrameVariables();
  }

  // const updateFrameVariables = () => {
  //   frameRef.current.contentWindow.numberValue = Date.now();
  // };

  // const refreshFrameSource = () => {
  //   // https://dev.to/pulljosh/how-to-load-html-css-and-js-code-into-an-iframe-2blc
  //   const url = getGeneratedPageURL({
  //     html: scriptableObjectData.data["html"].value,
  //     css: scriptableObjectData.data["css"].value,
  //     js: scriptableObjectData.data["js"].value,
  //   });
  //   frameRef.current.src = url;
  // };

  return (
    <>
      {/* <div
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
      </div> */}

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
        <button
          onClick={() => {
            // refreshFrameSource();
            saveToDb();
          }}
        >
          Save/Refresh
        </button>
        <button disabled={fileType === "js"} onClick={() => setfileType("js")}>
          script.js
        </button>
        <button
          disabled={fileType === "css"}
          onClick={() => setfileType("css")}
        >
          style.css
        </button>
        <button
          disabled={fileType === "html"}
          onClick={() => setfileType("html")}
        >
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
