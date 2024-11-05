"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";
import { StageContextProvider } from "@/components/StageContext";
import { theme } from "@/theme";
import { Editor } from "@/components/Editor";

import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ScriptableObject } from "@/components/ScriptObject";
import { useUser } from "../../../hooks/useUser";
import { Header } from "@/components/header";
import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "@/components/VideoObject";
import { Button } from "@mui/material";
import { Grid } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useStageIdFromSlug } from "@/hooks/useStageIdFromSlug";
import { ChatBox } from "@/components/Chat";

import isEqual from "lodash/isEqual";

import { useStageInfo } from "@/hooks/useStageInfo";

const drawerWidth = 500;


const StageInner = ({ params }) => {
  // const {stageId} = useStageIdFromSlug({slug: params.slug})
  const stageInfo = useStageInfo({slug: params.slug});

  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: false,
    roomId: stageInfo?.id,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  const searchParams = useSearchParams();
  const [hideChat, setHideChat] = useState(false);
  useEffect(() => {
    if (searchParams.get("hideChat")) {
      setHideChat(true);
    }
  }, [searchParams]);

  // add to the window so it can be used from the interactable sketches
  useEffect(() => {
    window.socket = socket;

    return () => {
      window.socket = undefined;
    };
  }, [socket]);

  const user = useUser();
  const myMousePosition = useRef({ x: -10, y: -10 });
  const stageContainerRef = useRef();


  // const [stageInfo, setStageInfo] = useState(false);
  const [features, setFeatures] = useState([]);

  const [isEditor, setIsEditor] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [displayNamesForChat, setDisplayNamesForChat] = useState({});
  const [chatCollapsed, setChatCollapsed] = useState(true);

  // add these to the window so they can be toggled from the interactable sketches
  useEffect(() => {
    window.openChat = () => {
      setChatCollapsed(false);
    };
    window.closeChat = () => {
      setChatCollapsed(true);
    };
    if (hideChat) {
      window.openChat = () => null;
      window.closeChat = () => null;
    }
  }, [hideChat]);

  const keys = useRef({});

  useEffect(() => {
    if (!stageInfo) return;
    const incomingFeatures = stageInfo.features;
    if (!isEqual(incomingFeatures, features)) {
      // Shallow update of only changed features
      const updatedFeatures = incomingFeatures.map((newFeature) => {
        const existingFeature = features.find((f) => f.id === newFeature.id);
        return existingFeature && isEqual(existingFeature, newFeature)
          ? existingFeature
          : newFeature;
      });
      setFeatures(updatedFeatures);
    }
  },[stageInfo, features]);

  useEffect(() => {
    console.log('features updated:',features);
  },[features])

  useEffect(() => {
    console.log({ stageInfo, user });
    if (!stageInfo || !user) return;
    if (stageInfo.editors.includes(user.id)) {
      setIsEditor(true);
      console.log("Setting isEditor to true!");
    }
  }, [stageInfo, user]);

  useEffect(() => {
    if (isEditor) {
      setShowHeader(true);
    }
  }, [isEditor]);

  const toggleEditorShown = useCallback(() => {
    setEditorOpen(!editorOpen);
  }, [editorOpen]);

  useEffect(() => {
    if (!socket || !stageInfo) return;

    // const stageInfoListener = (doc) => {
    //   setStageInfo(doc);
    // };

    const peerInfoListener = (info) => {
      window.peers = info;
    };

    socket.on("peerInfo", peerInfoListener);

    // socket.on("stageInfo", stageInfoListener);
    console.log("joining stage: ", stageInfo.id);
    socket.emit("joinStage", stageInfo.id);

    const chatListener = (info) => {
      setChatMessages(info.chats);
      let names = {};
      for (let i = 0; i < info.displayNamesForChat.length; i++) {
        let id = info.displayNamesForChat[i].socketId;
        let name = info.displayNamesForChat[i].displayName;
        names[id] = name;
      }
      setDisplayNamesForChat(names);
    };
    socket.on("chat", chatListener);

    return () => {
      socket.off("peerInfo", peerInfoListener);
      // socket.off("stageInfo", stageInfoListener);
      socket.off("chat", chatListener);
    };
  }, [socket]);

  return (
    <>
      {stageInfo && (
        <StageContextProvider stageInfo={stageInfo}>
          <PeerContextProvider peer={peer}>
            <Box sx={{ display: "flex" }}>
              {showHeader && <Header toggleEditorShown={toggleEditorShown} />}

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
                  {showHeader && <Toolbar />}

                  <Editor stageInfo={stageInfo} />
                </Drawer>
              )}

              <Box
                component="main"
                sx={{
                  width: editorOpen ? `calc(100vw - ${drawerWidth}px)` : `100%`,
                  p: 0,
                }}
              >
                {showHeader && <Toolbar />}
                <div
                  className="mainStage"
                  style={{
                    height: showHeader
                      ? "calc(100vh - 64px)"
                      : `calc(100vh - ${hideChat ? "0px" : "30px"})`,
                  }}
                >
                  <div className={"stageContainer"} ref={stageContainerRef}>
                    <BroadcastVideoSurface />
                    <BroadcastAudioPlayer />
                    {features.map((featureInfo) => {
                        switch (featureInfo.type) {
                          case "scriptableObject":
                            if (featureInfo.active) {
                              return (
                                <ScriptableObject
                                  key={featureInfo.id}
                                  scriptableObjectData={featureInfo}
                                />
                              );
                            } else return null;
                        }
                      })}
                  </div>
                </div>
              </Box>
              {!hideChat && (
                <ChatBox
                  chatMessages={chatMessages}
                  displayNamesForChat={displayNamesForChat}
                  collapsed={chatCollapsed}
                  setCollapsed={setChatCollapsed}
                />
              )}
            </Box>
          </PeerContextProvider>
        </StageContextProvider>
      )}
    </>
  );
};

export default function MyPage({ params }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {!hasInteracted && (
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "100vh" }}
          >
            <Grid item xs={3}>
              <Button
                onClick={() => setHasInteracted(true)}
                variant="text"
                size="large"
              >
                <Typography variant="h3">Enter Show</Typography>
              </Button>
            </Grid>
          </Grid>
        )}
        {hasInteracted && <StageInner params={params} />}
      </ThemeProvider>
    </>
  );
}
