"use client";

import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { ScriptEditor, ScriptableObject } from "@/components/ScriptObject";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";



export default function MyPage({ params }) {
  const videoRef = useRef();
  const [venueInfo, setVenueInfo] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false)

  useEffect(() => {
    const handler = (ev) => {
      if (ev.key === "e"){
        setEditorOpen(!editorOpen);
      }
    }
    document.addEventListener('keydown', handler,false);

    return () => {
      document.removeEventListener('keydown', handler);
    }
  },[editorOpen]);

  // const { peer, socket } = useSimpleMediasoupPeer({
  //   autoConnect: true,
  //   roomId: params.venueId,
  //   url: "http://localhost",
  //   port: 3030,
  // });

  const updateVenue = async () => {
    const updatedVenueInfo = venueInfo;
    updatedVenueInfo.description += 1;
    updatedVenueInfo.features.push({
      type: "scriptableObject",
      description: "hello",
    });
    console.log("sending updated Venue info: ", updatedVenueInfo);
    const res = await fetch(`/api/venue/${params.venueId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedVenueInfo }),
    });
    console.log("create venue response?", res);
  };
  const addVideo = async () => {
    const updatedVenueInfo = venueInfo;
    updatedVenueInfo.description += 1;
    updatedVenueInfo.features.push({
      type: "video",
      videoType: "webrtc",
      id: "12345",
    });
    console.log("sending updated Venue info: ", updatedVenueInfo);
    const res = await fetch(`/api/venue/${params.venueId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedVenueInfo }),
    });
    console.log("create venue response?", res);
  };

  useEffect(() => {
    console.log("venueInfo", venueInfo);
  }, [venueInfo]);

  useEffect(() => {
    async function getVenueInfo(venueId) {
      const res = await fetch(`/api/venue/${venueId}/info`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const venueInfo = await res.json();
      setVenueInfo(venueInfo);
      console.log("get venue response?", venueInfo);
    }
    getVenueInfo(params.venueId);
  }, [params.venueId]);

  // useEffect(() => {
  //   if (!socket) return;
  //   socket.on("venueInfo", (data) => {
  //     console.log("got venue info", data);
  //     setVenueInfo(data);
  //   });
  //   console.log("joinign venue", params.venueId);
  //   socket.emit("joinVenue", params.venueId);
  // }, [socket]);

  // useEffect(() => {
  //   console.log("socket:", socket);
  // }, [socket]);

  useEffect(() => {
    console.log(`This is the page for event: ${params.eventId}`);
  }, [params]);

  

  return (
    <PeerContextProvider>
      <div className="container-fluid">
        <div className="row align-items-start">
          <div className={editorOpen? 'col-8' : 'col-12'}>
            {venueInfo &&
              venueInfo.features.map((featureInfo) => {
                console.log(featureInfo);
                switch (featureInfo.type) {
                  case "scriptableObject":
                    return <div className="position-absolute">ScriptabasdfasdleObject</div>;

                  case "image":
                    return <div className="position-absolute">IMAGE</div>;

                  case "video":
                    return <div className="position-absolute"><VideoFeature featureInfo peer /></div>;
                }
              })}
          </div>
          <div className={editorOpen? 'col-4' : 'col-4 d-none'}>
            <button onClick={updateVenue}>UPDATE</button>
            <button onClick={addVideo}>ADD VIDEO</button>
          </div>
        </div>
      </div>

      {/* <div>{venueInfo ? JSON.stringify(venueInfo) : ""}</div> */}
    
    </PeerContextProvider>
  );
}
