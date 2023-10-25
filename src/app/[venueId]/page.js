"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";
import { VenueContextProvider } from "@/components/VenueContext";
import { theme } from "@/theme";
import { Editor } from "@/components/Editor";
import { FileDropzone } from "@/components/FileDropzone";

import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ScriptableObject } from "@/components/ScriptObject";
import { useUser } from "@/auth/hooks";

const drawerWidth = 440;

export default function MyPage({ params }) {
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.venueId,
    url: "http://localhost",
    port: 3030,
  });

  const user = useUser();

  useEffect(() => {
    if (!socket) return;
    console.log("socket", socket);

    socket.on("venueInfo", (doc) => {
      setVenueInfo(doc);
    });
    socket.emit("joinVenue", params.venueId);
  }, [socket]);

  const videoRef = useRef();
  const stageContainerRef = useRef();
  const [venueInfo, setVenueInfo] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const handler = (ev) => {
      if (ev.key === "e" && user) {
        setEditorOpen(!editorOpen);
      }
    };
    document.addEventListener("keydown", handler, false);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [editorOpen, user]);

  // useEffect(() => {
  //   console.log(stageContainerRef.current);
  // });

  // const updateVenue = async () => {
  //   const updatedVenueInfo = venueInfo;
  //   updatedVenueInfo.description += 1;
  //   updatedVenueInfo.features.push({
  //     type: "scriptableObject",
  //     description: "hello",
  //   });
  //   console.log("sending updated Venue info: ", updatedVenueInfo);
  //   const res = await fetch(`/api/venue/${params.venueId}/update`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ updatedVenueInfo }),
  //   });
  //   console.log("create venue response?", res);
  // };
  // const addVideo = async () => {
  //   const updatedVenueInfo = venueInfo;
  //   updatedVenueInfo.description += 1;
  //   updatedVenueInfo.features.push({
  //     type: "video",
  //     videoType: "webrtc",
  //     id: "12345",
  //   });
  //   console.log("sending updated Venue info: ", updatedVenueInfo);
  //   const res = await fetch(`/api/venue/${params.venueId}/update`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ updatedVenueInfo }),
  //   });
  //   console.log("create venue response?", res);
  // };

  useEffect(() => {
    console.log("venueInfo", venueInfo);
  }, [venueInfo]);

  // useEffect(() => {
  //   async function getVenueInfo(venueId) {
  //     const res = await fetch(`/api/venue/${venueId}/info`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     const response = await res.json();
  //     if (!response.error) {
  //       setVenueInfo(response);
  //     } else {
  //       console.error(response.error);
  //     }
  //     console.log("get venue response?", response);
  //   }
  //   getVenueInfo(params.venueId);
  // }, [params.venueId]);

  if (!venueInfo) {
    return <div>Venue not found.</div>;
  }

  return (
    <>
      <VenueContextProvider venueId={params.venueId}>
        <PeerContextProvider peer={peer}>
          <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex" }}>
              <CssBaseline />
              <AppBar
                variant="dense"
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
              >
                <Toolbar>
                  <Typography variant="h6" noWrap component="div">
                    Virtual Venue - {params.venueId}
                  </Typography>
                </Toolbar>
              </AppBar>

              {editorOpen && (
                <Drawer
                  variant="permanent"
                  sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                      width: drawerWidth,
                      boxSizing: "border-box",
                    },
                  }}
                >
                  <Toolbar />
                  <Editor venueInfo={venueInfo} />
                </Drawer>
              )}

              <Box
                component="main"
                sx={{ width: editorOpen? `calc(100vw - ${drawerWidth}px)` : `100%`, p: 0 }}
              >
                <Toolbar />
                <div className="mainStage">
                  {/* <FileDropzone /> */}
                  <div className={"stageContainer"} ref={stageContainerRef}>
                    {venueInfo &&
                      venueInfo.features.map((featureInfo) => {
                        switch (featureInfo.type) {
                          case "scriptableObject":
                            return (
                              <ScriptableObject
                                scriptableObjectData={featureInfo}
                              />
                            );

                          case "video":
                            return <VideoFeature info={featureInfo} />;
                        }
                      })}
                  </div>
                </div>
              </Box>
            </Box>
          </ThemeProvider>
        </PeerContextProvider>
      </VenueContextProvider>
    </>
  );
}
