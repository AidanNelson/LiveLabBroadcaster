import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useStageContext } from "@/components/StageContext";
import { Button, ToggleButton } from "@/components/Button";
import { EditableText } from "@/components/Editor/EditableText";
import {
  FeatureEditorHeader,
  FeatureEditorNameField,
} from "@/components/Editor/FeatureEditorPanel";
import { useEditorContext } from "../EditorContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clapperboard } from "lucide-react";

export const ScriptEditor = ({ scriptableObjectData }) => {
  const editorRef = useRef();

  const { editorStatus, setEditorStatus } = useEditorContext();

  const [localData, setLocalData] = useState(scriptableObjectData);
  const [activeFile, setActiveFile] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  useEffect(() => {
    // setEditorStatus((prev) => ({...prev, featureToPreview: null}))

    return () => {
      setEditorStatus((prev) => ({ ...prev, featureToPreview: null }));
    };
  }, []);

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
      <FeatureEditorHeader
        title="Interactive sketch"
        titleIcon={
          <Clapperboard
            className="size-6 shrink-0"
            aria-hidden
            strokeWidth={1.75}
          />
        }
      >
        <FeatureEditorNameField>
          <EditableText
            text={scriptableObjectData.name}
            variant="body1"
            onSave={(newName) => {
              updateFeature(scriptableObjectData.id, {
                name: newName,
              });
            }}
          />
        </FeatureEditorNameField>
        <div className="flex flex-row flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(
                "/" + scriptableObjectData.id + "/on",
              );
            }}
          >
            COPY OSC MSG
          </Button>
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
          <ToggleButton
            toggleActive={
              editorStatus?.featureToPreview?.id === scriptableObjectData.id
            }
            variant="primary"
            size="small"
            onClick={() =>
              setEditorStatus((prev) => ({
                ...prev,
                featureToPreview: prev.featureToPreview
                  ? null
                  : scriptableObjectData,
              }))
            }
          >
            Preview
          </ToggleButton>
        </div>
      </FeatureEditorHeader>

      <Tabs 
        value={activeFileIndex.toString()} 
        onValueChange={(value) => setActiveFileIndex(parseInt(value))}
      >
        <TabsList 
          className="bg-transparent border-none p-0 h-auto w-fit"
        >
          {localData?.info?.files.map((file, index) => (
            <TabsTrigger 
              key={index} 
              value={index.toString()}
              className="bg-transparent border-none rounded-none p-2 text-[var(--text-secondary-color)] hover:text-[var(--text-primary-color)] data-[state=active]:text-[var(--text-primary-color)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary-color)] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {file.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
