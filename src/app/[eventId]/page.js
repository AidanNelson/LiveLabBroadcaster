"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { OverlayModule } from "@/modules/OverlayModule";
import { ShawnsComponent } from "@/components/ShawnsComponent";
const ChatWindow = () => {
  return (
    <div>
      Chat Window
    </div>
  )
}
export default function MyPage({ params }) {
  const [initialized, setInitialized] = useState(false);
  const videoRef = useRef();

  useEffect(()=>{
    const myclickresponse = (ev) => {
      console.log('click',ev);
    }
    document.addEventListener('click',myclickresponse,false);
    
    return (() =>{
    document.removeEventListener('click',myclickresponse);
    })
  },[]);

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
    <div>HELLOß</div>
      <div
        style={{
          position: "absolute",
          marginLeft: "50vw",
          top: "50vh",
          padding: "0px",
          transform: "translateX(-50%) translateY(-50%)",
          zIndex: "10",
        }}
        className={'p-5 ml-2'}
      >
        <ShawnsComponent />
        {/* <OverlayModule /> */}
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
