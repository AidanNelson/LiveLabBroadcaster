"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";

export default function Event({ params }) {
  const [initialized, setInitialized] = useState(false);
  const videoRef = useRef();

  const { peer } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.eventId,
    url: "http://localhost",
    port: 3030,
  });

  useEffect(() => {
    console.log(`This is the page for event: ${params.eventId}`);
  }, [params]);

  useEffect(() => {
    console.log('peer:',peer);
    if (!peer) return;
    console.log("adding ontrack event");
    peer.on("track", (track) => {
      // deal with incoming track
      console.log("track:", track);
      if (track.track.kind === "video") {
        videoRef.current.srcObject = new MediaStream([track.track]);
      }
    });
  }, [peer]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          marginLeft: "50vw",
          top: "50vh",
          padding: "0px",
          transform: "translateX(-50%) translateY(-50%)",
          zIndex: "10",
        }}
      >
        {/* <button
          onClick={() => {
            setInitialized(true);
          }}
          style={{
            width: "100px",
            height: "50px",
            zIndex: 10,
            display: initialized ? "none" : "block",
          }}
        >
          Enter {params.eventId}
        </button> */}
        <video ref={videoRef} autoPlay muted playsInline />
      </div>
    </>
  );
}
