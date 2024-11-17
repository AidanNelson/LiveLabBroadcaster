import { Box } from "@mui/material";

import { useEffect, useState, useRef } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject, createDefaultCanvasObject } from "../../../shared/defaultDBEntries";

import { supabase } from "../SupabaseClient";
import { FileInner, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";
import { ToggleSwitch } from "../ToggleSwitch";

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

export const Editor = () => {
  const { stageInfo } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  const boxRef = useRef();

  useEffect(() => {
    console.log("stageInfo  in Editor Component: ", stageInfo);
  }, [stageInfo]);



  return (
    <>
      {editorStatus.type === "menu" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", width: "50%", marginRight: "auto", flexDirection: "column" }}>
            <div>MENU BAR - FEATURES</div>

            <button onClick={() => addScriptableObject({ stageInfo })}>

              <p>Add Scriptable Object</p>
            </button>


            <button onClick={() => addCanvasObject({ stageInfo })}>

              <p>Add Canvas Object</p>
            </button>

            <h5>Features</h5>
            <ul style={{ display: "flex", flexDirection: "column" }}>
              {stageInfo.features.map((feature, index) => {
                if (feature.type === "scriptableObject") {
                  return (
                    <li key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>

                      <em style={{ marginRight: "auto" }}>
                      {feature.name ? feature.name : feature.id}
                      </em>


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
                            type: "scriptEditor",
                            target: index,
                          });
                        }}

                      >
                        EDIT
                      </button>

                    </li>
                  );
                }
                if (feature.type === "canvas") {
                  return (
                    <li key={index} style={{ display: "flex", flexDirection: "row" }}>
                      
                      <em style={{ marginRight: "auto" }}>Canvas {feature.name ? feature.name : feature.id}</em>


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
                            type: "canvasEditor",
                            target: index,
                          });
                        }}
                      >
                        EDIT
                      </button>
                    </li>
                  );
                }
              })}


            </ul>
            <hr />

            <FileModal />
          </div>
        </>
      )
      }
      {editorStatus.type === "scriptEditor" && (
        <>
          <Box ref={boxRef} sx={{ height: `${window.innerHeight - 160}px` }}>
            <Box>
              <button
                onClick={() => {
                  setEditorStatus({
                    target: null,
                    type: "menu",
                  });
                }}
              >
                Back
              </button>
              <hr />
            </Box>
            <ScriptEditor
              scriptableObjectData={stageInfo.features[editorStatus.target]}
              featureIndex={editorStatus.target}
            />
          </Box>
        </>
      )}
      {editorStatus.type === "canvasEditor" && (
        <>
          <Box ref={boxRef} sx={{ height: `${window.innerHeight - 160}px` }}>
            <Box>
              <button
                onClick={() => {
                  setEditorStatus({
                    target: null,
                    type: "menu",
                  });
                }}
              >
                Back
              </button>
              <hr />
            </Box>
            CANVAS Editor
            <FileInner />
          </Box>
        </>
      )}
    </>
  );
};
