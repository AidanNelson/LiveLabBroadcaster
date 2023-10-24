import Editor from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";


export const ScriptEditor = ({ scriptableObjectData }) => {
    const editorRef = useRef();
  

    useEffect(() => {
      console.log({scriptableObjectData});

      // activeFile.value = scriptableObjectData.files[0]

    },[scriptableObjectData])
  
    const [activeFile, setActiveFile] = useState(scriptableObjectData.files[0]);

    const updateLocalValues = () => {
      const val = editorRef.current.getModel().getValue(2);
      console.log("current file: ", activeFile);
      console.log("current value:", val);
      activeFile.value = val;
    };
  
    const saveToDb = async () => {
      console.log(scriptableObjectData);

      const res = await fetch(`/api/venue/${'vvv'}/updateFeature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedFeatureInfo: scriptableObjectData }),
      });
      console.log("update feature response?", res);
    }
  
    function handleEditorDidMount(editor, monaco) {
      editorRef.current = editor;
    }
  
    return (
      <>
        <button
          onClick={() => {
            saveToDb();
          }}
        >
          Save/Refresh
        </button>
        {scriptableObjectData.files.map((file, index) => {
          return (
            <>
              <button
                // disabled={fileType === file.name}
                onClick={() => setActiveFile(scriptableObjectData.files[index])}
              >
                {file.name}
              </button>
            </>
          );
        })}
        {/* <button disabled={fileType === "js"} onClick={() => setfileType("js")}>
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
          </button> */}
        <Editor
          onMount={handleEditorDidMount}
          height="100%"
          width="100%"
          path={activeFile.name}
          defaultLanguage={activeFile.language}
          defaultValue={activeFile.value}
          onChange={updateLocalValues}
          // onValidate={(ev) => {
          //   console.log("validated");
          // }}
        />
      </>
    );
  };
  