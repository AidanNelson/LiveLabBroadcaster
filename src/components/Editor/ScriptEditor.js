import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { StageContext } from "../StageContext";

export const ScriptEditor = ({ scriptableObjectData }) => {
  const editorRef = useRef();

  const [localData, setLocalData] = useState(scriptableObjectData);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const {stageId} = useContext(StageContext)

  useEffect(() => {
    setLocalData(scriptableObjectData);
  }, [scriptableObjectData]);

  useEffect(() => {
    if (localData?.files?.length) {
      setActiveFile(localData.files[activeFileIndex]);
    }
  });

  const updateLocalValues = () => {
    const val = editorRef.current.getModel().getValue(2);
    console.log("current file: ", activeFile);
    console.log("current value:", val);
    activeFile.value = val;
  };

  const saveToDb = async () => {
    const activeModels = editorRef.current;
    console.log("active models:", activeModels);
    console.log("sending feature update to server", scriptableObjectData);

    const res = await fetch(`/api/stage/${stageId}/updateFeature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedFeatureInfo: scriptableObjectData }),
    });
    console.log("update feature response?", res);
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  return (
    <>
      <Box sx={{height: '100%'}}>
        <button
          onClick={() => {
            saveToDb();
          }}
        >
          Save/Refresh
        </button>
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
