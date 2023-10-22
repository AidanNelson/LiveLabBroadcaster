"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { ScriptEditor, ScriptableObject } from "@/components/ScriptObject";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";
import { VenueContextProvider } from "@/components/VenueContext";
import { StatusBar } from "@/components/StatusBar";
import {theme } from "@/theme";

import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

const drawerWidth = 240;

export default function MyPage({ params }) {
  const videoRef = useRef();
  const stageContainerRef = useRef();
  const [venueInfo, setVenueInfo] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const handler = (ev) => {
      if (ev.key === "e") {
        setEditorOpen(!editorOpen);
      }
    };
    document.addEventListener("keydown", handler, false);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [editorOpen]);

  useEffect(() => {
    console.log(stageContainerRef.current);
  });

  const updateVenue = async () => {
    const updatedVenueInfo = venueInfo;
    updatedVenueInfo.description += 1;
    updatedVenueInfo.features.push({
      type: "scriptableObject",
      description: "hello",
    });
    console.log("sending updated Venue info: ", updatedVenueInfo);
    const res = await fetch(`/api/venue/${params.venueId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedVenueInfo }),
    });
    console.log("create venue response?", res);
  };
  const addVideo = async () => {
    const updatedVenueInfo = venueInfo;
    updatedVenueInfo.description += 1;
    updatedVenueInfo.features.push({
      type: "video",
      videoType: "webrtc",
      id: "12345",
    });
    console.log("sending updated Venue info: ", updatedVenueInfo);
    const res = await fetch(`/api/venue/${params.venueId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedVenueInfo }),
    });
    console.log("create venue response?", res);
  };

  useEffect(() => {
    console.log("venueInfo", venueInfo);
  }, [venueInfo]);

  useEffect(() => {
    async function getVenueInfo(venueId) {
      const res = await fetch(`/api/venue/${venueId}/info`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const response = await res.json();
      if (!response.error) {
        setVenueInfo(response);
      }
      console.log("get venue response?", response);
    }
    getVenueInfo(params.venueId);
  }, [params.venueId]);

  if (!venueInfo) {
    return <div>Venue not found.</div>;
  }

  return (
    <>
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
              Virtual Venue
            </Typography>
          </Toolbar>
        </AppBar>


        {/* <Drawer
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
          <Box sx={{ overflow: "auto" }}>
            <List>
              {["Inbox", "Starred", "Send email", "Drafts"].map(
                (text, index) => (
                  <ListItem key={text} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  </ListItem>
                ),
              )}
            </List>
            <Divider />
            <List>
              {["All mail", "Trash", "Spam"].map((text, index) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer> */}


        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <Toolbar />
          <div className="mainStage">
            <VenueContextProvider venueId={params.venueId}>
              <PeerContextProvider venueId={params.venueId}>
                <div className={"stageContainer"} ref={stageContainerRef}>
                  {venueInfo &&
                    venueInfo.features.map((featureInfo) => {
                      // console.log(featureInfo);
                      switch (featureInfo.type) {
                        case "scriptableObject":
                          return null;
                          return (
                            <div className="position-absolute">
                              ScriptableObject
                            </div>
                          );

                        case "image":
                          return null;
                          return <div className="position-absolute">Image</div>;

                        case "video":
                          return <VideoFeature info={featureInfo} />;
                      }
                    })}
                </div>
              </PeerContextProvider>
            </VenueContextProvider>
          </div>
        </Box>
      </Box>
</ThemeProvider>

      {/* <StatusBar /> */}
    </>
  );
}
