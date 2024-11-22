"use client";

import { useEffect, useState, useRef } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { PeerContextProvider, usePeerContext } from "@/components/PeerContext";
import { useStageContext } from "@/components/StageContext";
import { useAuthContext } from "@/components/AuthContextProvider";
import { supabase } from "@/components/SupabaseClient";

const LobbyInner = () => {
  const { user, displayName, displayColor } = useAuthContext();
  const mousePosition = useRef({ x: 0, y: 0 });
  const [peers, setPeers] = useState([]);
  const { socket } = usePeerContext();

  useEffect(() => {
    socket.on("peerInfo", (info) => {
      // console.log("peerInfo", info);
      setPeers(info);
    });

    socket.emit("joinLobby", {
      lobbyId: "lobby",
      userId: user.id,
      displayName,
      displayColor,
    });

    const mouseSendInterval = setInterval(() => {
      socket.emit("mousePosition", {
        x: mousePosition.current.x,
        y: mousePosition.current.y,
      });
    }, 100);

    return () => {
      socket.off("peerInfo");
      clearInterval(mouseSendInterval);
    };
  }, [socket]);

  useEffect(() => {
    const onMouseMove = (e) => {
      mousePosition.current.x = e.clientX;
      mousePosition.current.y = e.clientY;
    };
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // useEffect(() => {
  //   const channel = supabase.channel("lobby_room");
  //   const MOUSE_EVENT = "position";

  //   // Subscribe to mouse events.
  //   // Our second parameter filters only for mouse events.
  //   channel
  //     .on("broadcast", { event: MOUSE_EVENT }, (info) => {
  //       receivedCursorPosition(info);
  //     })
  //     .subscribe();

  //   // Handle a mouse event.
  //   const receivedCursorPosition = ({ event, payload }) => {
  //     console.log(`
  //       User: ${payload.userId},
  //       displayName: ${payload.displayName},
  //       x Position: ${payload.x}
  //       y Position: ${payload.y}
  //     `);
  //   };

  //   // Helper function for sending our own mouse position.
  //   const sendMousePosition = (userId, displayName, x, y) => {
  //     return channel.send({
  //       type: "broadcast",
  //       event: MOUSE_EVENT,
  //       payload: { userId, displayName, x, y },
  //     });
  //   };

  //   const mouseSendInterval = setInterval(() => {
  //     sendMousePosition(user.id, displayName, mousePosition.x, mousePosition.y);
  //   }, 100);

  //   return () => {
  //     supabase.removeChannel(channel);
  //     clearInterval(mouseSendInterval);
  //   };
  // }, [user, displayName]);

  return (
    <>
      {Object.keys(peers).map((peerId) => {
        return (
          <div
            key={peers[peerId].id}
            style={{
              position: "absolute",
              left: peers[peerId].position.x,
              top: peers[peerId].position.y,
              color: peers[peerId].displayColor,
            }}
          >
            {peers[peerId].displayName}
          </div>
        );
      })}
    </>
  );
};
export default function Lobby() {
  const [hasInteracted, setHasInteracted] = useState(false);

  const { user, displayName, setDisplayName, displayColor, setDisplayColor } =
    useAuthContext();

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
                <input
                  id="colorPicker"
                  type="color"
                  value={displayColor}
                  onChange={(e) => setDisplayColor(e.target.value)}
                />
              </div>
              <div>
                <button onClick={() => setHasInteracted(true)}>
                  <h3>Enter Lobby Space</h3>
                </button>
              </div>
            </div>
          )}
          {hasInteracted && <LobbyInner />}
        </div>
      </PeerContextProvider>
    </>
  );
}
