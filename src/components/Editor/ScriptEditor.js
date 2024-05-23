import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState, useContext, useReducer } from "react";
import { TextField, Box } from "@mui/material";

import { StageContext } from "../StageContext";
// import { filesReducer, setFiles } from '../ScriptObject/filesReducer';
// import { initialState } from '../ScriptObject/files';
import { Modal } from "../Modal";

const SettingsModal = () => {
  return (
    <Modal>
      <div>hello</div>
    </Modal>
  );
};

export const ScriptEditor = ({ scriptableObjectData, setEditorStatus }) => {
  const editorRef = useRef();

  // const [state, dispatch] = useReducer(filesReducer, [], scriptableObjectData.files);
  const [files, setFiles] = useState(scriptableObjectData.files);

  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true);

  // const [localData, setLocalData] = useState(scriptableObjectData);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(1);
  const [scriptName, setScriptName] = useState(
    scriptableObjectData.name
      ? scriptableObjectData.name
      : scriptableObjectData.id,
  );

  const { stageId, editors } = useContext(StageContext);

  // useEffect(() => {
  //   setLocalData(scriptableObjectData);
  // }, [scriptableObjectData]);

  useEffect(() => {
    scriptableObjectData.name = scriptName;
  }, [scriptName]);

  // useEffect(() => {
  //   if (localData?.files?.length) {
  //     setActiveFile(localData.files[activeFileIndex]);
  //   }
  // });

  useEffect(() => {
    setActiveFile(files[activeFileIndex]);
  }, [files, activeFileIndex]);

  const updateLocalValues = () => {
    console.log("updating local values");
    const editorContent = editorRef.current.getModel().getValue(2);

    activeFile.content = editorContent;
    // console.log("current file: ", activeFile);
    // console.log("current value:", val);
    // activeFile.content = val;
  };

  const formatCode = () => {
    editorRef.current.getAction("editor.action.formatDocument").run();
  };

  const saveToDb = async () => {
    // const activeModels = editorRef.current;
    // console.log("active models:", activeModels);
    console.log("sending feature update to server", scriptableObjectData);

    const updatedFeatureInfo = scriptableObjectData;
    scriptableObjectData.files = files;
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
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <button
            onClick={() => {
              setEditorStatus({
                target: null,
                panel: "menu",
              });
            }}
          >
            Back
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
          {settingsPanelOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "150px",
              }}
            >
              <button
                onClick={() => {
                  setSettingsPanelOpen(!settingsPanelOpen);
                }}
              >
                &lt;&lt;
              </button>
              <label for="scriptNameInput">Script Name</label>
              <input
                id="scriptNameInput"
                placeholder="My Script Name"
                value={scriptName}
                onChange={(event) => {
                  setScriptName(event.target.value);
                }}
              />
              <button
                onClick={() => {
                  saveToDb();
                }}
              >
                Save
              </button>
              <button onClick={formatCode}>Format</button>
              <button onClick={() => console.log('delete!')}>Delete</button>

              <h4>Files</h4>

              {files.map((file, index) => {
                if (file.name === "root") return null;
                return (
                  <>
                    <button onClick={() => setActiveFileIndex(index)}>
                      {file.name}
                    </button>
                  </>
                );
              })}
            </div>
          )}
          {!settingsPanelOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <button
                onClick={() => {
                  setSettingsPanelOpen(!settingsPanelOpen);
                }}
              >
                &gt;&gt;
              </button>
            </div>
          )}

          <div
            style={{
              width: `calc(100% - ${settingsPanelOpen ? "150px" : "20px"}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ border: "1px solid white", padding: "5px" }}>
              {activeFile?.name}
            </div>

            {activeFile && (
              <Editor
                onMount={handleEditorDidMount}
                height="100%"
                width={`100%`}
                path={activeFile.name}
                defaultLanguage={activeFile.language}
                defaultValue={activeFile.content}
                onChange={updateLocalValues}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
