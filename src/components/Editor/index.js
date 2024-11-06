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

import { useEffect, useState, useRef, useContext } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";

import { supabase } from "../SupabaseClient";
import { FileUploadModal, FileList } from "./Files";

const addScriptableObject = async ({ stageInfo }) => {

  console.log('Current features:', stageInfo.features);
  const updatedFeaturesArray = structuredClone(stageInfo.features);
  updatedFeaturesArray.push(createDefaultScriptableObject());
  console.log('Updated features:', updatedFeaturesArray);

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
// import { StageContext } from "../StageContext";
// import { Sortable } from "./Sortable";
// import {verticalListSortingStrategy} from "@dnd-kit/sortable"

export const Editor = ({ stageInfo }) => {
  const boxRef = useRef();
  const [editorStatus, setEditorStatus] = useState({
    target: null,
    panel: "menu",
  });
  // const stageInfo = useContext(StageContext);
  useEffect(() => {
    console.log("stageInfo  in Editor Component: ", stageInfo);
  }, [stageInfo]);



  return (
    <>
      {editorStatus.panel === "menu" && (
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
                          panel: "scriptEditor",
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
              <ListItemButton onClick={addScriptableObject}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={`Add Scriptable Object`} />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
      {editorStatus.panel === "scriptEditor" && (
        <>
          <Box ref={boxRef} sx={{ height: `${window.innerHeight - 160}px` }}>
            <Box>
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
              <hr />
            </Box>
            <ScriptEditor
              scriptableObjectData={stageInfo.features[editorStatus.target]}
              featureIndex={editorStatus.target}
            />
          </Box>
        </>
      )}
      <FileUploadModal />
      <FileList />
    </>
  );
};
