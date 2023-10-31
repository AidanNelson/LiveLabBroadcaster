import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Switch from "@mui/material/Switch";

import EditIcon from '@mui/icons-material/Edit';

import { Box } from "@mui/material";

import { useEffect, useState, useRef } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";
import { updateFeature } from "../db";
export const Editor = ({ venueInfo }) => {
  const boxRef = useRef();
  const [editorStatus, setEditorStatus] = useState({
    target: null,
    panel: "menu",
  });
  useEffect(() => {
    console.log("Venue Info in Editor Component: ", venueInfo);
  }, [venueInfo]);

  const addScriptableObject = async () => {
    const updatedVenueInfo = venueInfo;
    updatedVenueInfo.features.push(createDefaultScriptableObject());
    console.log("Sending updated venue info: ", updatedVenueInfo);
    const res = await fetch(`/api/venue/${venueInfo.venueId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedVenueInfo }),
    });
    console.log("create venue response?", res);
  };
  return (
    <>
      {editorStatus.panel === "menu" && (
        <>
          <Typography variant="h5">Features</Typography>
          <List>
            {venueInfo.features.map((feature, index) => {
              if (feature.type === "scriptableObject") {
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <InboxIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`ScriptableObject - ${feature.id}`}
                    />
                    <Switch
                      onChange={(e) => updateFeature({...feature, active: e.target.checked})}
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
                  <InboxIcon />
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
              scriptableObjectData={venueInfo.features[editorStatus.target]}
            />
          </Box>
        </>
      )}
    </>
  );
};
