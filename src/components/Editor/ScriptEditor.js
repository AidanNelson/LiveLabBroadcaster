import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState, useContext } from "react";
import { TextField, Box } from "@mui/material";

import { StageContext } from "../StageContext";
import { updateFeature } from ".";

export const ScriptEditor = ({ scriptableObjectData, featureIndex }) => {
  const editorRef = useRef();

  const [localData, setLocalData] = useState(scriptableObjectData);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [scriptName, setScriptName] = useState(
    scriptableObjectData.name
      ? scriptableObjectData.name
      : scriptableObjectData.id,
  );

  const stageInfo = useContext(StageContext);
  useEffect(() => {
    setLocalData(scriptableObjectData);
  }, [scriptableObjectData]);

  useEffect(() => {
    scriptableObjectData.name = scriptName;
  }, [scriptName]);

  useEffect(() => {
    if (localData?.files?.length) {
      setActiveFile(localData.files[activeFileIndex]);
    }
  });

  const updateLocalValues = () => {
    const val = editorRef.current.getModel().getValue(2);
    // console.log("current file: ", activeFile);
    // console.log("current value:", val);
    activeFile.value = val;
  };

  const formatCode = () => {
    editorRef.current.getAction("editor.action.formatDocument").run();
  };

  // const saveToDb = async () => {
  //   console.log("Sending update to server: ", stageInfo.id);
  //   const url =
  //     process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ||
  //     "http://localhost:3030";
  //   const res = await fetch(
  //     url + `/stage/${stageInfo.id}/${scriptableObjectData.id}/update`,
  //     {
  //       method: "POST",
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ update: scriptableObjectData }),
  //     },
  //   );
  //   console.log("update feature response?", res);
  // };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  return (
    <>
      <Box sx={{ height: "100%" }}>
        <TextField
          id="standard-basic"
          label="Standard"
          variant="standard"
          value={scriptName}
          onChange={(event) => {
            setScriptName(event.target.value);
          }}
        />
        <button
          onClick={() => {
            updateFeature({stageInfo, updatedFeature: scriptableObjectData, updatedFeatureIndex:featureIndex })
          }}
        >
          Save/Refresh
        </button>
        <button onClick={formatCode}>Format</button>
        <hr />
        {localData.files.map((file, index) => {
          return (
            <>
              <button
                // disabled={fileType === file.name}
                onClick={() => setActiveFileIndex(index)}
              >
                {file.name}
              </button>
            </>
          );
        })}
        {activeFile && (
          <Editor
            onMount={handleEditorDidMount}
            height="100%"
            width="100%"
            path={activeFile.name}
            defaultLanguage={activeFile.language}
            defaultValue={activeFile.value}
            onChange={updateLocalValues}
          />
        )}
      </Box>
    </>
  );
};
