"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSimpleMediasoupPeer } from "../../../hooks/useSimpleMediasoupPeer";
import { PeerContextProvider } from "../../../components/PeerContext";
import { StageContextProvider } from "../../../components/StageContext";
import { Editor } from "../../../components/Editor";

import { useUser } from "../../../auth/hooks";
import { Header } from "../../../components/header";
import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "../../../components/VideoObject";

import { PreviewFrame } from "../../../components/ScriptObject/previewIndex";

import { useResize } from "../../../hooks/useResize";
import ShareModal from "../../../components/ShareModal";

const StageView = ({ stageInfo }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%"
        }}
      >
        <BroadcastVideoSurface />
        <BroadcastAudioPlayer />
        {/* <Interactables /> */}
        {/* TODO support multiple aspect ratios */}

        {stageInfo &&
          stageInfo.features.map((featureInfo) => {
            switch (featureInfo.type) {
              case "scriptableObject":
                if (featureInfo.active) {
                  return (
                    <PreviewFrame
                      key={featureInfo.id}
                      scriptableObjectData={featureInfo}
                    />
                  );
                } else return null;
            }
          })}
      </div>
    </>
  );
};

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
    };
  }, [socket]);

  return (
    <>
      {stageInfo && (
        <StageContextProvider stageInfo={stageInfo}>
          <PeerContextProvider peer={peer}>
            {isEditor && (
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
                    <div
                      style={{
                        width: "400px",
                        backgroundColor: "lightgreen",
                      }}
                    >
                      Text Editor Drawer
                    </div>
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
                  {editorOpen && (
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
                                      // setEditorStatus({
                                      //   panel: "scriptEditor",
                                      //   target: index,
                                      // });
                                    }}
                                  >
                                    *EDIT*
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
                      <div
                        style={{
                          flexGrow: "1",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "",
                        }}
                      >
                        Cues?
                      </div>
                      <div
                        style={{
                          flexGrow: "1",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "",
                        }}
                      >
                        Something Else
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
                    <div>Venue - {params.stageId}</div>
                    <button onClick={() => setShowShareModal(true)}>
                      SHARE
                    </button>
                    Status Bar (Audience View)
                  </div>
                </div>

                {editorOpen && (
                  <>
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
              </>
            )}
            {!isEditor && (
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
                      height: "calc(100vh - 40px)",
                      position: "relative",
                    }}
                  >
                    <StageView />
                  </div>
                  <div
                    style={{
                      backgroundColor: "lightgrey",
                      width: "100%",
                      height: "40px",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ padding: "10px" }}>
                      <strong>Venue - {stageInfo.stageId}</strong>
                    </div>
                    Status Bar (Audience View)
                  </div>
                </div>
              </>
            )}
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
