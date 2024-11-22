"use client";

import { useState } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { PeerContextProvider } from "@/components/PeerContext";
import { useStageContext } from "@/components/StageContext";
import { useAuthContext } from "@/components/AuthContextProvider";

export default function Lobby() {
  const [hasInteracted, setHasInteracted] = useState(false);

  const { user, displayName, setDisplayName, displayColor, setDisplayColor } = useAuthContext();

  const { stageInfo } = useStageContext();

  const { peer, socket } = useRealtimePeer({
    autoConnect: false,
    roomId: stageInfo?.id + "_lobby",
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  return (
    <>
      <PeerContextProvider peer={peer} socket={socket}>
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
                display: "flex",
                flexDirection: "column",
                alignSelf: "center",
                textAlign: "center",
                color: "white",
              }}
            >
              <div style={{ textAlign: "start" }}>
                <h1>
                  Before we get started, <br />
                  let's check a few things
                </h1>
              </div>
              <div>
                <label for="displayName">Display Name:</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <label for="colorPicker">Choose a color:</label>
                <input id="colorPicker" type="color" value={displayColor} onChange={(e) => setDisplayColor(e.target.value)} />
              </div>
              <div>
                <button onClick={() => setHasInteracted(true)}>
                  <h3>Enter Lobby Space</h3>
                </button>
              </div>
            </div>
          )}
          {hasInteracted && <>HELLO!</>}
        </div>
      </PeerContextProvider>
    </>
  );
}
