import { useEffect, useState, useRef, useCallback } from "react";

import { ScriptEditor } from "@/components/Editor/ScriptEditor/index.js";

// import { FileInner, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";
import { ResizablePanel } from "@/components/ResizablePanel";
import { AudienceView } from "@/app/[slug]/stage/page";
import Typography from "../Typography";

import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import styles from "./Editor.module.scss";

import { Button } from "@/components/Button";
import { FeaturesList } from "@/components/Editor/FeaturesList";
// import { FileUploadDropzone } from "./FileUploadDropzone";
import { EditableText } from "./EditableText";
import { FlexPanel } from "./FlexPanel";
import { ThreePanelLayout } from "../ThreePanelLayout";

// const addScriptableObject = async ({ stageInfo }) => {
// const scriptableObject = createDefaultScriptableObject();
// scriptableObject.stage_id = stageInfo.id;

//   const { data, error } = await supabase
//     .from('stages')
//     .update({ features: updatedFeaturesArray })
//     .eq('id', stageInfo.id)
//     .select()

//   if (error) {
//     console.error("Error adding scriptable object:", error);
//   } else {
//     console.log("Success. Added scriptable object: ", data);
//   }
// };

// const addCanvasObject = async ({ stageInfo }) => {

//   const updatedFeaturesArray = structuredClone(stageInfo.features);
//   updatedFeaturesArray.push(createDefaultCanvasObject());

//   const { data, error } = await supabase
//     .from('stages')
//     .update({ features: updatedFeaturesArray })
//     .eq('id', stageInfo.id)
//     .select()

//   if (error) {
//     console.error("Error adding scriptable object:", error);
//   } else {
//     console.log("Success. Added scriptable object: ", data);
//   }
// }

const FeaturesListAndControls = () => {
  const { stageInfo, features, addFeature } = useStageContext();
  return (
    <>
      <div>
        <FeaturesList />
      </div>
    </>
  );
};

export const EditorSidePanel = () => {
  const { features, updateFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
    <>
      {editorStatus.target == null && <FeaturesListAndControls />}
      {editorStatus.target !== null && <FeatureEditors />}
    </>
  );
};

const FeatureEditors = () => {
  const { features, updateFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();
  const [currentFeatureName, setCurrentFeatureName] = useState(
    features.find((feature) => feature.id === editorStatus.target).name,
  );


  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        <div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setEditorStatus({
                ...editorStatus,
                sidePanelOpen: false,
                target: null,
                currentEditor: null,
              });
            }}
          >
            &larr; Back
          </Button>
        </div>
        {/* <div style={{ padding: "var(--spacing-16)" }}>
          <EditableText
            text={currentFeatureName}
            onSave={(newName) => {
              updateFeature(
                features.find((feature) => feature.id === editorStatus.target)
                  .id,
                {
                  name: newName,
                },
              );
            }}
          />
        </div> */}

        {editorStatus.currentEditor === "scriptEditor" && (
          <>
            <div style={{ height: "80%" }}>
              <ScriptEditor
                scriptableObjectData={features.find(
                  (feature) => feature.id === editorStatus.target,
                )}
              />
            </div>
          </>
        )}
        {/* {editorStatus.currentEditor === "canvasEditor" && (
          <>
            Canvas Editor
            <FileInner />
          </>
        )} */}
      </div>
    </>
  );
};

export const StageEditor = () => {
  
  return (
    <ThreePanelLayout 
      left={<EditorSidePanel />}
      rightTop={<AudienceView />}
      rightBottom={<FlexPanel />}
    />
  )
}
