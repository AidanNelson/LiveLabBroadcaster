"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { ScriptEditor, ScriptableObject } from "@/components/ScriptEditor";


export default function MyPage({ params }) {
  const videoRef = useRef();
  const [venueInfo, setVenueInfo] = useState(null);

  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.venueId,
    url: "http://localhost",
    port: 3030,
  });

  const updateVenue = async () => {
    const updatedVenueInfo = venueInfo;
    console.log('sending updated Venue info: ',updatedVenueInfo);
    const res = await fetch(`/api/venue/${params.venueId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({updatedVenueInfo })
    })
    console.log('create venue response?',res);
  }

  useEffect(() => {
    console.log("venueInfo", venueInfo);
  }, [venueInfo]);

  useEffect(() => {
    async function getVenueInfo (venueId){
      const res = await fetch(`/api/venue/${venueId}/info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const venueInfo = await res.json();
      setVenueInfo(venueInfo);
      console.log('get venue response?',venueInfo);
    }
    getVenueInfo(params.venueId)
  },[params.venueId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("venueInfo", (data) => {
      console.log('got venue info',data);
      setVenueInfo(data);
    })
    console.log('joinign venue', params.venueId)
    socket.emit('joinVenue', (params.venueId));

  }, [socket]);

  useEffect(() => {
    console.log("socket:", socket);
  }, [socket]);

  useEffect(() => {
    console.log(`This is the page for event: ${params.eventId}`);
  }, [params]);

  useEffect(() => {
    console.log("peer:", peer);
    if (!peer) return;
    console.log("socket:", peer.socket);
    console.log("adding ontrack event");
    peer.on("track", (track) => {
      // deal with incoming track
      console.log("track:", track);
      if (track.track.kind === "video") {
        const broadcastStream = new MediaStream([track.track]);
        videoRef.current.srcObject = broadcastStream;
      }
    });
  }, [peer]);

  return (
    <>
    <button onClick={updateVenue}>UPDATE</button>
      {/* {venueInfo.features.forEach((feature) => {
      if (feature.type == 'script') return (
        <ScriptEditor socket={socket} />
      )
    })} */}
      {/* <div
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
      </div> */}
      {/* <div
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
      </div> */}
    </>
  );
}
