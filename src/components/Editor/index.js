import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import Switch from "@mui/material/Switch";

import EditIcon from "@mui/icons-material/Edit";

import { Box } from "@mui/material";

import { useEffect, useState, useRef } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";

import { supabase } from "../SupabaseClient";
import { FileUpload, FileList, FileModal } from "./Files";
import { useStageContext } from "../StageContext";
import { useEditorContext } from "./EditorContext";

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

export const updateFeature = async ({ stageInfo, updatedFeature, updatedFeatureIndex }) => {
  const updatedFeaturesArray = structuredClone(stageInfo.features);
  console.log('updated:',updatedFeaturesArray);
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
  const {editorStatus, setEditorStatus } = useEditorContext();
  
  const boxRef = useRef();

  useEffect(() => {
    console.log("stageInfo  in Editor Component: ", stageInfo);
  }, [stageInfo]);



  return (
    <>
      {editorStatus.type === "menu" && (
        <>
          <Typography variant="h5">Features</Typography>
          {/* <Sortable strategy={verticalListSortingStrategy}
  itemCount={5} /> */}
          <List>
            {stageInfo.features.map((feature, index) => {
              if (feature.type === "scriptableObject") {
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${feature.name ? feature.name : feature.id}`}
                    />
                    <Switch
                      onChange={(e) =>
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
                      checked={feature.active}
                    />
                    <ListItemButton
                      onClick={() => {
                        setEditorStatus({
                          type: "scriptEditor",
                          target: index,
                        });
                      }}
                    >
                      <EditIcon />
                    </ListItemButton>
                  </ListItem>
                );
              }
              if (feature.type === "canvas") {
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`CANVAS-${feature.name ? feature.name : feature.id}`}
                    />
                    <Switch
                      onChange={(e) =>
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
                      checked={feature.active}
                    />
                    <ListItemButton
                      onClick={() => {
                        setEditorStatus({
                          type: "canvasEditor",
                          target: index,
                        });
                      }}
                    >
                      <EditIcon />
                    </ListItemButton>
                  </ListItem>
                );
              }
              // if (feature.type === "video") {
              //   return (
              //     <ListItem key={index} disablePadding>
              //       <ListItemButton>
              //         <ListItemIcon>
              //           <InboxIcon />
              //         </ListItemIcon>
              //         <ListItemText primary={`Video - ${index}`} />
              //       </ListItemButton>
              //     </ListItem>
              //   );
              // }
            })}
            <ListItem key={"add"} disablePadding>
              <ListItemButton onClick={() => addScriptableObject({stageInfo})}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={`Add Scriptable Object`} />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
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
            {/* <ScriptEditor
              scriptableObjectData={stageInfo.features[editorStatus.target]}
              featureIndex={editorStatus.target}
            /> */}
          </Box>
        </>
      )}
      <FileModal />
    </>
  );
};
