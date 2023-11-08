"use client";

import { useEffect, useState, useRef } from "react";
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

const drawerWidth = 440;

export default function MyPage({ params }) {
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.stageId,
    url: "https://realtime.livelab.app",
    port: 443,
  });

  const user = useUser();

  useEffect(() => {
    if (!socket) return;
    console.log("socket", socket);

    const stageInfoListener = (doc) => {
      setStageInfo(doc);
    };

    socket.on("stageInfo", stageInfoListener);
    socket.emit("joinStage", params.stageId);

    return () => {
      socket.off(stageInfo, stageInfoListener);
    };
  }, [socket]);

  const stageContainerRef = useRef();
  const [stageInfo, setStageInfo] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);

  // useEffect(() => {
  //   const keys = {};
  //   const keyDownListener = (e) => {
  //     keys[e.key] = true;
  //     console.log(keys);
  //   }
  //   const keyUpListener = (e) => {
  //     keys[e.key] = false;
  //   }
  //   document.addEventListener('keydown', keyDownListener, false);
  //   document.addEventListener('keyup', keyUpListener, false);
    
  //   // if (user.id && stageInfo.editors.includes(user.id)){


  //   // }
  //   return () => {
  //     document.removeEventListener('keydown', keyDownListener);
  //     document.removeEventListener('keyup', keyUpListener);
  //   }
  // },[]);

  useEffect(() => {
    console.log("stageInfo", stageInfo);
  }, [stageInfo]);

  if (!stageInfo) {
    return <div>Stage not found.</div>;
  }

  return (
    <>
      <StageContextProvider stageInfo={stageInfo}>
        <PeerContextProvider peer={peer}>
          <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex" }}>
              <CssBaseline />
              <Header />

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
                <Toolbar />
                <div className="mainStage">
                  <div className={"stageContainer"} ref={stageContainerRef}>
                    {stageInfo &&
                      stageInfo.features.map((featureInfo) => {
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
      </StageContextProvider>
    </>
  );
}
