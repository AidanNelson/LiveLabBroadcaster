"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { OverlayModule } from "@/modules/OverlayModule";
import { ShawnsComponent } from "@/components/ShawnsComponent";
import { ScriptEditor, ScriptableObject } from "@/components/ScriptEditor";
const ChatWindow = () => {
  return <div>Chat Window</div>;
};
export default function MyPage({ params }) {
  const [initialized, setInitialized] = useState(false);
  const videoRef = useRef();
  const overlayRef = useRef();
  const [venueInfo, setVenueInfo] = useState(null);

  // const exampleNumberValueRef = useRef(1);

  // useEffect(() => {
  //   console.log(overlayRef.current);
  //   // example of updating values and making them available to the iframe
  //   setInterval(() => {
  //     overlayRef.current.contentWindow.numberValue =
  //       exampleNumberValueRef.current++;
  //   }, 1000);
  // }, []);

  useEffect(() => {
    const myclickresponse = (ev) => {
      console.log("click", ev);
    };
    document.addEventListener("click", myclickresponse, false);

    return () => {
      document.removeEventListener("click", myclickresponse);
    };
  }, []);

  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.venueId,
    url: "http://localhost",
    port: 3030,
  });

  useEffect(() => {
    console.log("venueInfo", venueInfo);
  }, [venueInfo]);

  useEffect(() => {
    if (!socket) return;
    socket.on("venueInfo", (data) => {
      setVenueInfo(data);
    })
    socket.emit('joinVenue', (params.venueId));
    // socket.emit("getVenueInfo", params.venueId, (resp) => {
    //   console.log(resp);
    //   setVenueInfo(resp);
    // });
  }, [socket]);

  useEffect(() => {
    console.log("socket:", socket);
  }, [socket]);

  useEffect(() => {
    console.log(`This is the page for event: ${params.eventId}`);
  }, [params]);

  useEffect(() => {
    console.log("peer:", peer);
    // console.log("socket:",peer.socket);
    if (!peer) return;
    console.log("socket:", peer.socket);
    console.log("adding ontrack event");
    peer.on("track", (track) => {
      // deal with incoming track
      console.log("track:", track);
      if (track.track.kind === "video") {
        const broadcastStream = new MediaStream([track.track]);

        // add the broadcast stream to the iframe overlay
        // overlayRef.current.contentWindow.broadcastStream = broadcastStream;

        videoRef.current.srcObject = broadcastStream;
      }
    });
  }, [peer]);

  return (
    <>
      {/* {venueInfo.features.forEach((feature) => {
      if (feature.type == 'script') return (
        <ScriptEditor socket={socket} />
      )
    })} */}
      <div
        style={{
          width: `100vw`,
          height: `100vh`,
          position: `absolute`,
          top: `0px`,
          left: `0px`,
          zIndex: 20,
        }}
      >
        {venueInfo && (
          <>
            <ScriptableObject scriptableObjectData={venueInfo} />

            <ScriptEditor
              socket={socket}
              venueId={params.venueId}
              scriptableObjectData={venueInfo}
            />
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          marginLeft: "50vw",
          top: "50vh",
          padding: "0px",
          transform: "translateX(-50%) translateY(-50%)",
          zIndex: 1,
        }}
        className={"p-5 ml-2"}
      >
        <video ref={videoRef} autoPlay muted playsInline />
      </div>
    </>
  );
}
