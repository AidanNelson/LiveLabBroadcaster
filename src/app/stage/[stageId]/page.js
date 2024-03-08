"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSimpleMediasoupPeer } from "../../../hooks/useSimpleMediasoupPeer";
import { PeerContextProvider } from "../../../components/PeerContext";
import { StageContextProvider } from "../../../components/StageContext";
import { Editor } from "../../../components/Editor";

// import { ScriptableObject } from "../../../components/ScriptObject";
import { useUser } from "../../../auth/hooks";
import { Header } from "../../../components/header";
import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "../../../components/VideoObject";

import { PreviewFrame } from "../../../components/ScriptObject/previewIndex";

import { useResize } from "../../../hooks/useResize";
import ShareModal from "../../../components/ShareModal";

// const drawerWidth = 500;

const StageInner = ({ params }) => {
  const { width, enableResize } = useResize({ minWidth: 200 });
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: false,
    roomId: params.stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ? 443 : 3030,
  });

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
  const [showShareModal, setShowShareModal] = useState(false);

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

    // const peerInfoListener = (info) => {
    //   window.peers = info;
    // };

    // socket.on("peerInfo", peerInfoListener);
    // const interval = setInterval(() => {
    //   socket.emit("mousePosition", myMousePosition.current);
    // }, 50);

    socket.on("stageInfo", stageInfoListener);
    socket.emit("joinStage", params.stageId);

    return () => {
      // socket.off("peerInfo", peerInfoListener);
      socket.off(stageInfo, stageInfoListener);
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
            {showShareModal && (
              <ShareModal
                isOpen={showShareModal}
                setIsOpen={setShowShareModal}
              />
            )}
            <div>
              {showHeader && (
                <Header
                  toggleEditorShown={toggleEditorShown}
                  setShowShareModal={setShowShareModal}
                />
              )}

              {editorOpen && (
                <>
                  {/* {showHeader && <Toolbar />} */}

                  <Editor stageInfo={stageInfo} />
                  <div
                    style={{
                      position: "absolute",
                      width: "10px",
                      top: "0px",
                      right: "0px",
                      bottom: "0px",
                      cursor: "col-resize",
                    }}
                    onMouseDown={enableResize}
                  />
                </>
              )}

              <div
                component="main"
                sx={{
                  width: editorOpen ? `calc(100vw - ${width}px)` : `100%`,
                  right: "0px",
                  p: 0,
                }}
              >
                {/* {showHeader && <Toolbar />} */}
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
                            if (featureInfo.active) {
                              return (
                                // <ScriptableObject
                                //   key={featureInfo.id}
                                //   scriptableObjectData={featureInfo}
                                // />
                                <PreviewFrame
                                  key={featureInfo.id}
                                  scriptableObjectData={featureInfo}
                                />
                              );
                            } else return null;
                        }
                      })}
                  </div>
                </div>
              </div>
            </div>
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
      {!hasInteracted && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <button onClick={() => setHasInteracted(true)}>Enter Show</button>
        </div>
      )}
      {hasInteracted && <StageInner params={params} />}
    </>
  );
}
