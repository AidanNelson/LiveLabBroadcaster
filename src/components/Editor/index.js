import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { useEffect, useState } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";


export const Editor = ({ venueInfo }) => {
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
          <h3>Features</h3>
          <List>
            {venueInfo.features.map((feature, index) => {
              if (feature.type === "scriptableObject") {
                return (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setEditorStatus({
                          panel: "scriptEditor",
                          target: index,
                        });
                      }}
                    >
                      <ListItemIcon>
                        <InboxIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`ScriptableObject - ${feature.id}`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              }
              //   if (feature.type === "video") {
              //     return (
              //       <ListItem key={index} disablePadding>
              //         <ListItemButton>
              //           <ListItemIcon>
              //             <InboxIcon />
              //           </ListItemIcon>
              //           <ListItemText primary={`Video - ${index}`} />
              //         </ListItemButton>
              //       </ListItem>
              //     );
              //   }
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
          <button onClick={() => {
            setEditorStatus({
              target: null,
              panel: "menu",
            })
          }}>BACK</button>
          <ScriptEditor
            scriptableObjectData={venueInfo.features[editorStatus.target]}
          />
        </>
      )}
    </>
  );
};
