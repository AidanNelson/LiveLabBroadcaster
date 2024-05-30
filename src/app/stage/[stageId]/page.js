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
import { Button } from "@mui/material";
import { Grid } from "@mui/material";
import { useSearchParams } from "next/navigation";

const drawerWidth = 500;

const ChatBox = ({
  chatMessages,
  displayNamesForChat,
  collapsed,
  setCollapsed,
}) => {
  const messageBoxRef = useRef();
  const textInputRef = useRef();
  const displayNameInputRef = useRef();
  const [displayNameIsSet, setDisplayNameIsSet] = useState(false);
  const [groupedMessages, setGroupedMessages] = useState([]);

  const [setNameButtonEnabled, setSetNameButtonEnabled] = useState(false);

  const [newMsg, setNewMsg] = useState(false);

  useEffect(() => {
    if (displayNamesForChat[window.socket.id]) {
      setDisplayNameIsSet(true);
    }
  }, [displayNamesForChat]);

  useEffect(() => {
    let displayNamesAndMessages = "";
    chatMessages.sort((a, b) => a.timestamp - b.timestamp);
    let grouped = [];
    for (let i = 0; i < chatMessages.length; i++) {
      const chatMsg = chatMessages[i];
      const displayName = displayNamesForChat[chatMsg.from] || chatMsg.from;
      displayNamesAndMessages += displayName + " :  " + chatMsg.message + "\n";
      grouped = [...grouped, { displayName, message: chatMsg.message }];
    }

    setNewMsg(true);
    setGroupedMessages(grouped);
    setTimeout(() => {
      setNewMsg(false);
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }, 100);
  }, [chatMessages, displayNamesForChat]);
  return (
    <>
      <div
        style={{
          zIndex: 1000,
          color: 0xfff,
          position: "absolute",
          bottom: "0px",
          right: "0px",
          width: "100vw",

          height: "30px",
          backgroundColor: "rgba(50,50,50,1)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            zIndex: 1000,
            color: 0xfff,
            position: "absolute",
            marginRight: "50px",
            width: "400px",
            bottom: collapsed ? "0px" : "30px",

            height: collapsed ? "" : "200px",
            backgroundColor: "rgba(100,100,100,1)",

            display: "flex",
            flexDirection: "column",
            padding: "5px",
          }}
        >
          <div
            style={{
              // height: "30px",
              width: "100%",
              textAlign: "center",
              // display: "flex",
              // flexDirection: "row",
              // alignItems: "center",
              // padding: "5px",
            }}
          >
            <h5
              style={{
                // flexGrow: 1,
                color: newMsg ? "rgba(255,255,255,1)" : "rgba(200,200,200,1)",
                fontSize: newMsg ? "12px" : "11px",
                transition: "all 0.5s",
                position: "absolute",
                left: "50%",
                transform: "translate(-50%,0)"
              }}
            >
              Chat
            </h5>
            <button
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              style={{
                float: "right",
                backgroundColor: "transparent",
                color: "rgba(220,220,220,1)",
                border: 0,
                cursor: "pointer",
                width: "50px",
                height: "100%",
              }}
            >
              {collapsed ? "^" : "X"}
            </button>
          </div>

          <div
            ref={messageBoxRef}
            style={{
              display: collapsed || !displayNameIsSet ? "none" : "flex",
              flex: 1,
              overflow: "auto",
              color: 0xddd,
              flexDirection: "column",
              marginTop: "5px",
              marginBottom: "5px",
            }}
          >
            {groupedMessages &&
              groupedMessages.map((msg, i) => {
                return (
                  <div key={i} style={{ color: 0xfff, marginTop: "3px" }}>
                    <strong>{msg.displayName}</strong> : {msg.message}
                  </div>
                );
              })}
          </div>
          {!displayNameIsSet && !collapsed && (
            <div
              style={{
                display: collapsed ? "none" : "flex",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "30px",
                alignItems: "center",
                justifyItems: "center",
                marginTop: "2em",
              }}
            >
              <h3
                style={{
                  marginBottom: "2em",
                }}
              >
                What is your name?
              </h3>
              <div>
                <input
                  ref={displayNameInputRef}
                  onChange={(e) => {
                    setSetNameButtonEnabled(true);
                  }}
                  type={"text"}
                  placeholder="Your Name..."
                  style={{
                    flexGrow: 1,
                    margin: "2px",
                    backgroundColor: "rgba(50,50,50,0.5)",
                    color: "rgba(255,255,255,1)",
                    padding: "5px",
                  }}
                ></input>
                <button
                  onClick={() => {
                    window.socket.emit(
                      "setDisplayNameForChat",
                      displayNameInputRef.current.value,
                    );
                  }}
                  style={{
                    backgroundColor: setNameButtonEnabled
                      ? "rgba(200,100,200,1)"
                      : "grey",
                    color: "black",
                    padding: "5px",
                    border: 0,
                    margin: "2px",
                  }}
                  disabled={!setNameButtonEnabled}
                >
                  <strong>Join Chat</strong>
                </button>
              </div>
            </div>
          )}

          {displayNameIsSet && (
            <div
              style={{
                display: collapsed ? "none" : "flex",
                height: "30px",
              }}
            >
              <input
                ref={textInputRef}
                type={"text"}
                style={{
                  flexGrow: 1,
                  backgroundColor: "rgba(50,50,50,0.5)",
                  color: "rgba(255,255,255,1)",
                  margin: "2px",
                }}
              ></input>
              <button
                onClick={() => {
                  window.socket.emit("chat", textInputRef.current.value);
                  textInputRef.current.value = "";
                }}
                style={{
                  backgroundColor: "rgba(200,100,200,1)",
                  color: "black",
                  padding: "5px",
                  margin: "2px",
                  border: 0,
                }}
              >
                <strong>Send</strong>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const StageInner = ({ params }) => {
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: false,
    roomId: params.stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  const searchParams = useSearchParams();
  const [hideChat, setHideChat] = useState(false);
  useEffect(() => {
    if (searchParams.get("hideChat")) {
      setHideChat(true);
    }
  }, searchParams);

  useEffect(() => {
    window.socket = socket;

    return () => {
      window.socket = undefined;
    };
  }, [socket]);

  const user = useUser();
  const myMousePosition = useRef({ x: -10, y: -10 });
  const stageContainerRef = useRef();
  const [stageInfo, setStageInfo] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [displayNamesForChat, setDisplayNamesForChat] = useState({});
  const [chatCollapsed, setChatCollapsed] = useState(true);

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

  useEffect(() => {
    console.log({ user });
  }, [user]);
  const keys = useRef({});

  useEffect(() => {
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
    if (!socket) return;

    const stageInfoListener = (doc) => {
      setStageInfo(doc);
    };

    const peerInfoListener = (info) => {
      window.peers = info;
    };

    socket.on("peerInfo", peerInfoListener);
    // const interval = setInterval(() => {
    //   socket.emit("mousePosition", myMousePosition.current);
    // }, 50);

    socket.on("stageInfo", stageInfoListener);
    socket.emit("joinStage", params.stageId);

    // setInterval(() => {
    //   socket.emit("chat", "hello");
    // }, 2000);

    const chatListener = (info) => {
      console.log("chat message:", info);
      setChatMessages(info.chats);
      setDisplayNamesForChat(info.displayNamesForChat);
      // for (let chatMsg of info.chats) {
      //   const displayName =
      //     info.displayNamesForChat[chatMsg.from] || chatMsg.from;
      //   console.log(chatMsg.message, "from", displayName);
      // }
    };
    socket.on("chat", chatListener);
    // socket.emit("setDisplayNameForChat", "aidan");

    return () => {
      socket.off("peerInfo", peerInfoListener);
      socket.off(stageInfo, stageInfoListener);
      socket.off("chat", chatListener);
      // clearInterval(interval);
    };
  }, [socket]);

  // useEffect(() => {
  //   console.log();
  //   const mouseMoveListener = (e) => {
  //     console.log('mousemove:',e);
  //     if (stageContainerRef.current) {
  //       const offset = stageContainerRef.current.getBoundingClientRect();
  //       const x = (e.clientX - offset.left) / offset.width; //x position within the element.
  //       const y = (e.clientY - offset.top) / offset.height; //y position within the element.
  //       myMousePosition.current = { x, y };
  //       window.MyMouseX = x;
  //       window.MyMouseY = y;
  //     }
  //   };
  //   window.addEventListener("mousemove", mouseMoveListener, false);
  //   return () => {
  //     window.removeEventListener("mousemove", mouseMoveListener);
  //   };
  // }, [stageInfo]);

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
                    {stageInfo &&
                      stageInfo.features.map((featureInfo) => {
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
