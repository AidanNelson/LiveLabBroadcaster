"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSimpleMediasoupPeer } from "../../../hooks/useSimpleMediasoupPeer";
import { PeerContextProvider } from "../../../components/PeerContext";
import { StageContextProvider } from "../../../components/StageContext";


import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "../../../components/VideoObject";

import { PreviewFrame } from "../../../components/ScriptObject/previewIndex";

import "../../stage/[stageId]/stage.css";

const AudienceLayout = ({ children, stageInfo }) => {
  return (
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
        {children}
      </div>
    </div>
  );
};
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
          backgroundColor: "rgba(250,0,250,0.2)",
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

  const [stageInfo, setStageInfo] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const stageInfoListener = (doc) => {
      setStageInfo(doc);
    };

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
            <AudienceLayout stageInfo={stageInfo}>
              <StageView stageInfo={stageInfo} />
            </AudienceLayout>
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
