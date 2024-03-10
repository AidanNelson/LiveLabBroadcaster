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

import { useEffect, useState, useRef, useContext, useCallback } from "react";

import { ScriptEditor } from "./ScriptEditor";
import { createDefaultScriptableObject } from "../../../shared/defaultDBEntries";
import { updateFeature } from "../db";
import { StageContext } from "../StageContext";
// import { Sortable } from "./Sortable";
// import {verticalListSortingStrategy} from "@dnd-kit/sortable"
import { StageView } from "../../app/stage/[stageId]/page";
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

  const [editorOpen, setEditorOpen] = useState(false);

  const toggleEditorShown = useCallback(() => {
    setEditorOpen(!editorOpen);
  }, [editorOpen]);

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
      {/* {editorStatus.panel === "menu" && ( */}
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexGrow: "1",
              // height: "calc(100vw - 50px)",
            }}
          >
            {editorStatus.panel === "scriptEditor" && (
              <div
                style={{
                  width: "400px",
                  height: '100%',
                  backgroundColor: "lightgreen",
                }}
              >
                
                
                <ScriptEditor
                  scriptableObjectData={stageInfo.features[editorStatus.target]}
                  setEditorStatus={setEditorStatus}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexGrow: "1",
                position: "relative",
              }}
            >
              <StageView stageInfo={stageInfo} />
            </div>
          </div>
          {editorOpen && editorStatus.panel === "menu" && (
            <div
              style={{
                backgroundColor: "yellow",
                width: "100%",
                height: "300px",
                display: "flex",
                flexDirection: "row",
              }}
            >
              <div
                style={{
                  flexGrow: "1",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <strong>Scenes</strong>
                <div>
                  <button>Scene 1</button>
                </div>
                <div>
                  <button>Scene 2</button>
                </div>
                <div>
                  <button>Scene 3</button>
                </div>
              </div>
              <div
                style={{
                  flexGrow: "1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "",
                }}
              >
                <strong>Interactables</strong>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "",
                  }}
                >
                  {stageInfo.features.map((feature, index) => {
                    if (feature.type === "scriptableObject") {
                      return (
                        <div key={index}>
                          {feature.name ? feature.name : feature.id}
                          <button
                            onClick={() => {
                              console.log("clicked");
                              setEditorStatus({
                                panel: "scriptEditor",
                                target: index,
                              });
                            }}
                          >
                            Edit
                          </button>

                          {/* <Switch
                              onChange={(e) =>
                                updateFeature(stageInfo.stageId, {
                                  ...feature,
                                  active: e.target.checked,
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
                            </ListItemButton> */}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              backgroundColor: "lightgrey",
              width: "100%",
              height: "50px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <button onClick={toggleEditorShown}>EDIT</button>
            <div>Venue - {stageInfo.stageId}</div>
            <button onClick={() => setShowShareModal(true)}>SHARE</button>
            Status Bar (Audience View)
          </div>
        </div>
        {/* <Typography variant="h5">Admin</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary={`Access`} />

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
          </List> */}
        {/* <Typography variant="h5">Features</Typography> */}
        {/* <Sortable strategy={verticalListSortingStrategy}
  itemCount={5} /> */}
        {/* <List>
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
                        updateFeature(stageInfo.stageId, {
                          ...feature,
                          active: e.target.checked,
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
          </List> */}
      </>
      {/* )} */}
      {/* {editorStatus.panel === "scriptEditor" && ( */}
      <>
        {/* <Box ref={boxRef} sx={{ height: `${window.innerHeight - 160}px` }}>
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
          </Box> */}
      </>
      {/* )} */}
    </>
  );
};
