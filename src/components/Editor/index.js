import { Box } from "@mui/material";

import { useEffect, useState, useRef } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject, createDefaultCanvasObject } from "../../../shared/defaultDBEntries";

import { supabase } from "../SupabaseClient";
import { FileInner, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";
import { ToggleSwitch } from "../ToggleSwitch";
import { ResizableBox } from 'react-resizable';
import { ResizablePanel } from "@/components/ResizablePanel";
import { AudienceView } from "@/app/stage/[slug]/page";
import { editor } from "monaco-editor";

const addScriptableObject = async ({ stageInfo }) => {

  const updatedFeaturesArray = structuredClone(stageInfo.features);
  updatedFeaturesArray.push(createDefaultScriptableObject());

  const { data, error } = await supabase
    .from('stages')
    .update({ features: updatedFeaturesArray })
    .eq('id', stageInfo.id)
    .select()

  if (error) {
    console.error("Error adding scriptable object:", error);
  } else {
    console.log("Success. Added scriptable object: ", data);
  }
};

const addCanvasObject = async ({ stageInfo }) => {

  const updatedFeaturesArray = structuredClone(stageInfo.features);
  updatedFeaturesArray.push(createDefaultCanvasObject());

  const { data, error } = await supabase
    .from('stages')
    .update({ features: updatedFeaturesArray })
    .eq('id', stageInfo.id)
    .select()

  if (error) {
    console.error("Error adding scriptable object:", error);
  } else {
    console.log("Success. Added scriptable object: ", data);
  }
}

const FeaturesList = () => {
  const { stageInfo, features } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();
  return (
    <>
      <ul style={{ display: "flex", flexDirection: "column" }}>
        {features.map((feature, index) => {
          return (
            <li key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center", marginLeft: "10px", marginRight: "10px" }}>

              {feature.type === "scriptableObject" && (
                <>


                  <p style={{ marginRight: "auto" }}>
                    {feature.name ? feature.name : feature.id}
                  </p>


                  <ToggleSwitch
                    setIsChecked={(e) =>
                      updateFeature({
                        stageInfo,
                        updatedFeature: {
                          ...feature,
                          active: e.target.checked,
                        },
                        updatedFeatureIndex: index
                      })
                    }
                    isChecked={feature.active}

                  />
                  <button
                    onClick={() => {
                      setEditorStatus({
                        ...editorStatus,
                        sidePanelOpen: true,
                        currentEditor: "scriptEditor",
                        target: index,
                      });
                    }}

                  >
                    EDIT
                  </button>


                </>)}

              {feature.type === "canvas" && (
                <>

                  <p style={{ marginRight: "auto" }}>{feature.name ? feature.name : feature.id}</p>


                  <ToggleSwitch
                    setIsChecked={(e) =>
                      updateFeature({
                        stageInfo,
                        updatedFeature: {
                          ...feature,
                          active: e.target.checked,
                        },
                        updatedFeatureIndex: index
                      })
                    }
                    size="small"
                    isChecked={feature.active}
                  />
                  <button
                    onClick={() => {
                      setEditorStatus({
                        ...editorStatus,
                        sidePanelOpen: true,
                        currentEditor: "canvasEditor",
                        target: index,
                      });
                    }}
                  >
                    EDIT
                  </button>

                </>)}

            </li>
          )
        })}


      </ul>
    </>)
}

const EditorBottomPanel = () => {
  const { stageInfo } = useStageContext();
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
        <div style={{ display: "flex", width: "50%", marginRight: "auto", flexDirection: "column" }}>
          <div>MENU BAR - FEATURES</div>
          <FeaturesList />
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "50%", marginLeft: "auto" }}>
          <button onClick={() => addScriptableObject({ stageInfo })}>
            <p>Add Scriptable Object</p>
          </button>
          <button onClick={() => addCanvasObject({ stageInfo })}>
            <p>Add Canvas Object</p>
          </button>
          <FileModal />
        </div>
      </div>
    </>
  )
}

export const updateFeature = async ({ stageInfo, updatedFeature, updatedFeatureIndex }) => {
  const updatedFeaturesArray = structuredClone(stageInfo.features);
  console.log('updated:', updatedFeaturesArray);
  updatedFeaturesArray[updatedFeatureIndex] = updatedFeature;

  const { data, error } = await supabase
    .from('stages')
    .update({ features: updatedFeaturesArray })
    .eq('id', stageInfo.id)
    .select()

  if (error) {
    console.error("Error updating feature:", error);
  } else {
    console.log("Success.  Updated feature: ", data);
  }
};
// import { Sortable } from "./Sortable";
// import {verticalListSortingStrategy} from "@dnd-kit/sortable"

export const EditorSidePanel = () => {
  const { stageInfo } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();
  const [currentFeatureName, setCurrentFeatureName] = useState(stageInfo.features[editorStatus.target].name);

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
      <button onClick={() => {
        updateFeature({
          stageInfo,
          updatedFeature: {
            ...stageInfo.features[editorStatus.target],
            name: currentFeatureName,
          },
          updatedFeatureIndex: editorStatus.target,
        });
      }}>SAVE NAME</button>
      {editorStatus.currentEditor === "scriptEditor" && (
        <>
          <ScriptEditor
            scriptableObjectData={stageInfo.features[editorStatus.target]}
            featureIndex={editorStatus.target}
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
  const [panelHeight, setPanelHeight] = useState(300); // Initial height of the panel
  const [panelWidth, setPanelWidth] = useState(300); // Initial width of the panel

  const { editorStatus } = useEditorContext();
  return (

    <>
      {editorStatus.editorIsOpen && (
        <>
          <div style={{
            width: "100%",
            height: `calc(100vh - ${panelHeight}px)`,
            position: "relative",
            display: "flex",
            flexDirection: "row",
          }}>
            {editorStatus.sidePanelOpen && (
              <ResizablePanel panelSize={panelWidth} setPanelSize={setPanelWidth} resizeDirection="horizontal">
                <EditorSidePanel />
              </ResizablePanel>
            )}

            <div style={{
              width: `${editorStatus.sidePanelOpen ? `calc(100vw - ${panelWidth}px)` : "100%"}`,
              position: "relative"
            }}>
              <AudienceView />
            </div>
          </div>


          <ResizablePanel panelSize={panelHeight} setPanelSize={setPanelHeight}>
            <EditorBottomPanel />
          </ResizablePanel>
        </>
      )}
    </>

  )
}