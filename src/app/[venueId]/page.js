"use client";

import styles from "./stage.module.css";
import { useEffect, useState, useRef } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { ScriptEditor, ScriptableObject } from "@/components/ScriptObject";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";

export default function MyPage({ params }) {
  const videoRef = useRef();
  const stageContainerRef = useRef();
  const [venueInfo, setVenueInfo] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const handler = (ev) => {
      if (ev.key === "e") {
        setEditorOpen(!editorOpen);
      }
    };
    document.addEventListener("keydown", handler, false);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [editorOpen]);

  useEffect(() => {
console.log(stageContainerRef.current);
  })

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
      const response = await res.json();
      if (!response.error) {
        setVenueInfo(response);
      }
      console.log("get venue response?", response);
    }
    getVenueInfo(params.venueId);
  }, [params.venueId]);

  if (!venueInfo) {
    return <div>Venue not found.</div>;
  }

  return (
    <PeerContextProvider venueId={params.venueId}>
      <div className={styles.appContainer}>
        <div className={styles.stageContainer} ref={stageContainerRef}>
          {venueInfo &&
            venueInfo.features.map((feature) => {
              console.log(feature);
              switch (feature.type) {
                case "scriptableObject":
                  return null;
                  return (
                    <div className="position-absolute">ScriptableObject</div>
                  );

                case "image":
                  return null;
                  return <div className="position-absolute">Image</div>;

                case "video":
                  return <VideoFeature feature />;
              }
            })}
        </div>
      </div>
      {/* <div className={editorOpen ? "col-4" : "col-4 d-none"}>
            <button onClick={updateVenue}>UPDATE</button>
            <button onClick={addVideo}>ADD VIDEO</button>
          </div> */}
      {/* </div> */}
      {/* </div> */}
    </PeerContextProvider>
  );
}
