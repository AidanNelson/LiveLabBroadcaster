import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import Switch from "@mui/material/Switch";

import EditIcon from '@mui/icons-material/Edit';

import { Box } from "@mui/material";

import { useEffect, useState, useRef, useContext } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";
import { updateFeature } from "../db";
import { StageContext } from "../StageContext";
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

  const addScriptableObject = async () => {
    const updatedStageDoc = stageInfo;
    updatedStageDoc.features.push(createDefaultScriptableObject());
    console.log("Sending updated stage info: ", updatedStageDoc);
    const res = await fetch(`/api/stage/${stageInfo.stageId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedStageDoc }),
    });
  };
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
                      primary={`ScriptableObject - ${feature.id}`}
                    />
                    <Switch
                      onChange={(e) => updateFeature(stageInfo.stageId, {...feature, active: e.target.checked})}
                      defaultChecked
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
            />
          </Box>
        </>
      )}
    </>
  );
};
