"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSimpleMediasoupPeer } from "../../../hooks/useSimpleMediasoupPeer";
import { PeerContextProvider } from "../../../components/PeerContext";
import { StageContextProvider } from "../../../components/StageContext";
import { Editor } from "../../../components/Editor";

import { useUser } from "../../../auth/hooks";
import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "../../../components/VideoObject";

import { PreviewFrame } from "../../../components/ScriptObject/previewIndex";

import { useResize } from "../../../hooks/useResize";
import ShareModal from "../../../components/ShareModal";

import "./stage.css";


const EditorLayout = ({children, stageInfo}) => {

  return (<div
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
      {children}
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
  </div>)
}

const AudienceLayout = ({children, stageInfo}) => {

  return (<div
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
      {children}
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
  </div>)
}
export const StageView = ({ stageInfo }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          backgroundColor: 'rgba(250,0,250,0.2)'
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
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: false,
    roomId: params.stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
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
                <Editor stageInfo={stageInfo} />
              </>
            )}
            {!isEditor && (
              <>
                <AudienceLayout stageInfo={stageInfo}>
                  <StageView stageInfo={stageInfo} />
                </AudienceLayout>
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
