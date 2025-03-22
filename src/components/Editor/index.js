import { Box } from "@mui/material";

import { useEffect, useState, useRef, useCallback } from "react";

import { ScriptEditor } from "./ScriptEditor";

import { supabase } from "../SupabaseClient";
import { FileInner, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";
import { ToggleSwitch } from "../ToggleSwitch";
import { ResizableBox } from "react-resizable";
import { ResizablePanel } from "@/components/ResizablePanel";
import { AudienceView } from "@/app/[slug]/stage/page";
import { editor } from "monaco-editor";
import Typography from "../Typography";

import { MdEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import styles from "./Editor.module.scss";

import { Tree } from "antd";
import { Popconfirm } from "antd";
import { Button } from "@/components/Button";
import { FeaturesList } from "@/components/Editor/FeaturesList";
import { FileUploadDropzone } from "./FileUploadDropzone";

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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            padding: "var(--spacing-32)",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <Button variant="secondary" size="small">
            Exit
          </Button>
          <div style={{ flexGrow: 1, paddingLeft: "10px" }}>
            <Typography variant={"subtitle"}>{stageInfo.title} </Typography>
          </div>
        </div>
        <FeaturesList />
      </div>
    </>
  );
};

// export const updateFeature = async ({ stageInfo, updatedFeature, updatedFeatureIndex }) => {
//   const updatedFeaturesArray = structuredClone(stageInfo.features);
//   console.log('updated:', updatedFeaturesArray);
//   updatedFeaturesArray[updatedFeatureIndex] = updatedFeature;

//   const { data, error } = await supabase
//     .from('stages')
//     .update({ features: updatedFeaturesArray })
//     .eq('id', stageInfo.id)
//     .select()

//   if (error) {
//     console.error("Error updating feature:", error);
//   } else {
//     console.log("Success.  Updated feature: ", data);
//   }
// };
// import { Sortable } from "./Sortable";
// import {verticalListSortingStrategy} from "@dnd-kit/sortable"

export const EditorSidePanel = () => {
  const { features, updateFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  return (
    <>
      {editorStatus.target == null && <FeaturesListAndControls />}
      {editorStatus.target !== null && <EditorFeatureEditors />}
    </>
  );
};

export const EditorFeatureEditors = () => {
  const { features, updateFeature } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();
  const [currentFeatureName, setCurrentFeatureName] = useState(
    features.find((feature) => feature.id === editorStatus.target).name,
  );

  return (
    <>
      <div>
        <button
          onClick={() => {
            setEditorStatus({
              ...editorStatus,
              sidePanelOpen: false,
              target: null,
              currentEditor: null,
            });
          }}
        >
          Close
        </button>
      </div>
      <input
        type="text"
        value={currentFeatureName}
        onChange={(event) => {
          setCurrentFeatureName(event.target.value);
        }}
      />
      <button
        onClick={() => {
          updateFeature(features[editorStatus.target].id, {
            name: currentFeatureName,
          });
        }}
      >
        SAVE NAME
      </button>
      {editorStatus.currentEditor === "scriptEditor" && (
        <>
          <ScriptEditor
            scriptableObjectData={features.find(
              (feature) => feature.id === editorStatus.target,
            )}
          />
        </>
      )}
      {editorStatus.currentEditor === "canvasEditor" && (
        <>
          Canvas Editor
          <FileInner />
        </>
      )}
    </>
  );
};

export const EditorView = () => {
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
  });
  const { editorStatus } = useEditorContext();

  return (
    <>
      <>
        <div
          style={{
            width: "100%",
            height: `100%`,
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
                height: `calc(100vh - ${panelHeight}px)`,
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
                background: "var(--ui-dark-grey)",
              }}
            >
              <FileUploadDropzone />
              <FileInner />
            </ResizablePanel>
          </div>
        </div>
      </>
    </>
  );
};
