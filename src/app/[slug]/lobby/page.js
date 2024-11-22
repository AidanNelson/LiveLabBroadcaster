"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { PeerContextProvider } from "@/components/PeerContext";
import { useStageContext } from "@/components/StageContext";
import { EditorView } from "@/components/Editor";

import { useEditorContext } from "@/components/Editor/EditorContext";
import { useAuthContext } from "@/components/AuthContextProvider.js";



const LobbyInner = () => {
  const { stageInfo } = useStageContext();
  const { editorStatus, setEditorStatus } = useEditorContext();

  const { peer, socket } = useRealtimePeer({
    autoConnect: false,
    roomId: stageInfo?.id,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  

  return (
    <>
      <PeerContextProvider peer={peer} socket={socket}>
        {editorStatus.isEditor && <EditorView />}
        {!editorStatus.isEditor && <AudienceView />}
      </PeerContextProvider>
    </>
  );
};

export default function Lobby() {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      >
        {!hasInteracted && (
          <div
            style={{
              width: "100%",
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            <button onClick={() => setHasInteracted(true)}>
              <h3>Enter Lobby Space</h3>
            </button>
          </div>
        )}
        {hasInteracted && <LobbyInner />}
      </div>
    </>
  );
}
