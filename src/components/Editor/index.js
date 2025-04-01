
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
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
        <div style={{ padding: "var(--spacing-16)" }}>
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
        </div>

        {editorStatus.currentEditor === "scriptEditor" && (
          <>
            <div style={{ flexGrow: 1, height: "70%" }}>
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

export const EditorView = () => {
  const [navBarHeight, setNavBarHeight] = useState(() => {
    return document.getElementById('navBar')?.offsetHeight || 75;
  })
  const [panelWidth, setPanelWidth] = useState(() => {
    const savedPanelWidth = Number(localStorage.getItem("panelWidth"));
    const startingWidth = savedPanelWidth
      ? savedPanelWidth
      : window.innerWidth / 2;
    return startingWidth;
  }); // Initial width of the panel

  const [panelHeight, setPanelHeight] = useState(() => {
    const savedPanelHeight = Number(localStorage.getItem("panelHeight"));
    const startingHeight = savedPanelHeight
      ? savedPanelHeight
      : window.innerHeight / 2;
    return startingHeight;
  }); // Initial height of the panel

  useEffect(() => {
    localStorage.setItem("panelWidth", panelWidth);
  }, [panelWidth]);

  useEffect(() => {
    localStorage.setItem("panelHeight", panelHeight);
  }, [panelHeight]);

  return (
    <>
      <>
        <div
          style={{
            width: "100vw",
            height: "calc(100vh - " + navBarHeight + "px)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ResizablePanel
            panelSize={panelWidth}
            setPanelSize={setPanelWidth}
            resizeDirection="horizontal"
            
          >
            <EditorSidePanel />
          </ResizablePanel>

          <div
            style={{
              width: `calc(100vw - ${panelWidth}px)`,
              position: "relative",
            }}
          >
            <div
              style={{
                height: `calc(100vh - ${panelHeight}px - ${navBarHeight}px)`, 
                position: "relative",
              }}
            >
              <AudienceView />
            </div>
            <ResizablePanel
              panelSize={panelHeight}
              setPanelSize={setPanelHeight}
              resizeDirection="vertical"
              style={{
                position: "relative",
              }}
            >
              <FlexPanel />
            </ResizablePanel>
          </div>
        </div>
      </>
    </>
  );
};

