import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useStageContext } from "@/components/StageContext";
import { Button, ToggleButton } from "@/components/Button";
import styles from "./ScriptEditor.module.scss";
import { EditableText } from "@/components/Editor/EditableText";
import { useEditorContext } from "../EditorContext";


export const ScriptEditor = ({ scriptableObjectData }) => {
  const editorRef = useRef();

  const { editorStatus, setEditorStatus } = useEditorContext();

  const [localData, setLocalData] = useState(scriptableObjectData);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  useEffect(() => {
    // setEditorStatus((prev) => ({...prev, featureToPreview: null}))

    return () => {
      setEditorStatus((prev) => ({...prev, featureToPreview: null}))
    }
  },[])

  const { updateFeature } = useStageContext();
  useEffect(() => {
    setLocalData(scriptableObjectData);
  }, [scriptableObjectData]);

  useEffect(() => {
    if (localData?.info?.files?.length) {
      setActiveFile(localData.info.files[activeFileIndex]);
    }
  });

  const updateLocalValues = () => {
    const val = editorRef.current.getModel().getValue(2);
    activeFile.value = val;
  };

  const formatCode = () => {
    editorRef.current.getAction("editor.action.formatDocument").run();
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          padding: "var(--spacing-16)",
        }}
      >
        <EditableText
          text={scriptableObjectData.name}
          onSave={(newName) => {
            updateFeature(scriptableObjectData.id, {
              name: newName,
            });
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "var(--spacing-8)",
          }}
        >
          <Button variant="primary" size="small" onClick={formatCode}>
            Format
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              updateFeature(scriptableObjectData.id, scriptableObjectData);
            }}
          >
            Save
          </Button>
          <ToggleButton toggleActive={editorStatus?.featureToPreview?.id === scriptableObjectData.id} variant="primary" size="small" onClick={() => setEditorStatus((prev) => ({
                ...prev,
                featureToPreview: prev.featureToPreview ?
                  null
                  : scriptableObjectData,
              }))}>
            Preview
          </ToggleButton>
          {/* // <input
          //   type="checkbox"
          //   checked={
              
          //   }
          //   onChange={(e) => {
          //     setEditorStatus({
          //       ...editorStatus,
          //       featureToPreview: e.target.checked
          //         ? scriptableObjectData
          //         : null,
          //     });
          //   }}
          // /> */}
        </div>
      </div>

      {localData.info.files.map((file, index) => {
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
          // height="100%"
          // width="100%"
          path={activeFile.name}
          defaultLanguage={activeFile.language}
          defaultValue={activeFile.value}
          onChange={updateLocalValues}
          theme="vs-dark"
          options={{
            scrollBeyondLastLine: false,
          }}
          // scrollBeyondLastLine={false}
          // alwaysConsumeMouseWheel={false}
        />
      )}
    </>
  );
};
