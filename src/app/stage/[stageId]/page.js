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
import { useUser } from "@/auth/hooks";
import { Header } from "@/components/header";
import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "@/components/VideoObject";

const drawerWidth = 440;

const StageInner = ({ params }) => {
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ? 443 : 3030,
  });

  useEffect(() => {
    window.socket = socket;

    return () => {
      window.socket = undefined;
    }
  },[socket]);

  const user = useUser();
  const myMousePosition = useRef({ x: -10, y: -10 });
  const stageContainerRef = useRef();
  const [stageInfo, setStageInfo] = useState(false);
  const [isEditor, setIsEditor]  = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  const keys = useRef({});

  useEffect(() => {
    if (!stageInfo || !user) return;
    if (stageInfo.editors.includes(user.id)){
      setIsEditor(true);
      console.log('Setting isEditor to true!');
    }
  },[stageInfo,user]);

  useEffect(() => {
    if (isEditor){
      setShowHeader(true);
    }
  },[isEditor]);

  const toggleEditorShown = useCallback(() => {
    setEditorOpen(!editorOpen);
  },[editorOpen]);

  useEffect(() => {
    if (!socket) return;

    const stageInfoListener = (doc) => {
      setStageInfo(doc);
    };

    const peerInfoListener = (info) => {
      window.peers = info;
    };

    socket.on("peerInfo", peerInfoListener);
    const interval = setInterval(() => {
      socket.emit("mousePosition", myMousePosition.current);
    }, 50);

    socket.on("stageInfo", stageInfoListener);
    socket.emit("joinStage", params.stageId);

    return () => {
      socket.off("peerInfo", peerInfoListener);
      socket.off(stageInfo, stageInfoListener);
      clearInterval(interval);
    };
  }, [socket]);

  useEffect(() => {
    console.log();
    const mouseMoveListener = (e) => {
      if (stageContainerRef.current) {
        const offset = stageContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - offset.left) / offset.width; //x position within the element.
        const y = (e.clientY - offset.top) / offset.height; //y position within the element.
        myMousePosition.current = { x, y };
      }
    };
    window.addEventListener("mousemove", mouseMoveListener, false);
    return () => {
      window.removeEventListener("mousemove", mouseMoveListener);
    };
  }, [stageInfo]);

  // useEffect(() => {
  //   if (!stageInfo) return;
  //   const keyDownListener = (e) => {
  //     keys.current[e.key] = true;
  //     console.log(keys.current);

  //     // const userIsEditor = stageInfo?.editors.includes(user?.id);

  //     const userIsEditor = true;
  //     if (keys.current["Control"] && keys.current["e"] && userIsEditor) {
  //       console.log({ userIsEditor });
  //       console.log("toggling editor visibility");
  //       setEditorOpen(!editorOpen);
  //     }
  //     if (keys.current["Control"] && keys.current["h"]) {
  //       setShowHeader(!showHeader);
  //     }
  //   };
  //   const keyUpListener = (e) => {
  //     keys.current[e.key] = false;
  //   };

  //   document.addEventListener("keydown", keyDownListener, false);
  //   document.addEventListener("keyup", keyUpListener, false);

  //   return () => {
  //     document.removeEventListener("keydown", keyDownListener);
  //     document.removeEventListener("keyup", keyUpListener);
  //   };
  // }, [editorOpen, stageInfo, showHeader, user]);

  return (
    <>
      <ThemeProvider theme={theme}>
        {stageInfo && (
          <StageContextProvider stageInfo={stageInfo}>
            <PeerContextProvider peer={peer}>
              <Box sx={{ display: "flex" }}>
                <CssBaseline />
                {showHeader && <Header toggleEditorShown={toggleEditorShown}/>}

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
                    width: editorOpen
                      ? `calc(100vw - ${drawerWidth}px)`
                      : `100%`,
                    p: 0,
                  }}
                >
                  {showHeader && <Toolbar />}
                  <div
                    className="mainStage"
                    style={{
                      height: showHeader ? "calc(100vh - 64px)" : "100vh",
                    }}
                  >
                    <div className={"stageContainer"} ref={stageContainerRef}>
                      <BroadcastVideoSurface />
                      <BroadcastAudioPlayer />
                      {stageInfo &&
                        stageInfo.features.map((featureInfo) => {
                          switch (featureInfo.type) {
                            case "scriptableObject":
                              return (
                                <>
                                {featureInfo.active && (<ScriptableObject
                                  scriptableObjectData={featureInfo}
                                />)}
                                </>
                              );

                            case "video":
                              return <VideoFeature info={featureInfo} />;
                          }
                        })}
                    </div>
                  </div>
                </Box>
              </Box>
            </PeerContextProvider>
          </StageContextProvider>
        )}
      </ThemeProvider>
    </>
  );
};
export default function MyPage({ params }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      {!hasInteracted && (
        <button onClick={() => setHasInteracted(true)}>Enter Show</button>
      )}
      {hasInteracted && <StageInner params={params} />}
    </>
  );
}
