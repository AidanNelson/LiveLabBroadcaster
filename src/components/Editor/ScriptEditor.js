import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useStageContext } from "../StageContext";
import { Button } from "@/components/Button";

export const ScriptEditor = ({ scriptableObjectData }) => {
  const editorRef = useRef();

  const [localData, setLocalData] = useState(scriptableObjectData);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const { updateFeature } = useStageContext();

  useEffect(() => {
    setLocalData(scriptableObjectData);
  }, [scriptableObjectData]);

  useEffect(() => {
    if (localData?.info?.files?.length) {
      setActiveFile(localData.info.files[activeFileIndex]);
    }
  }, [localData, activeFileIndex]);

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
    <div className={styles.scriptEditorContainer}>
      <Button
        onClick={() => {
          updateFeature(scriptableObjectData.id, scriptableObjectData);
        }}
      >
        Save
      </Button>
      <button onClick={formatCode}>Format</button>
      <hr />
      <div>
        {localData.info.files.map((file, index) => (
          <button key={file.name} onClick={() => setActiveFileIndex(index)}>
            {file.name}
          </button>
        ))}
      </div>
      <div className={styles.editorContainer}>
        {activeFile && (
          <Editor
            className={styles.editor}
            onMount={handleEditorDidMount}
            height="100%"
            width="100%"
            path={activeFile.name}
            defaultLanguage={activeFile.language}
            defaultValue={activeFile.value}
            onChange={updateLocalValues}
            theme={"vs-dark"}
          />
        )}
      </div>
    </div>
  );
};
