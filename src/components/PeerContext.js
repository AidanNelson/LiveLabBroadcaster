
import React, { createContext, useState, useEffect } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";

export const PeerContext = createContext();

export const PeerContextProvider = ({ peer, children }) => {


  useEffect(() => {
    if (!peer) return;
    peer.on("track", (track) => {
      // deal with incoming track
      console.log("track:", track);
      if (track.track.kind === "video") {
        const broadcastStream = new MediaStream([track.track]);
        addStream(broadcastStream);
      }
    });
  }, [peer]);
    const [availableStreams, setAvailableStreams] = useState([]);

    const addStream = (stream) => {
      setAvailableStreams([...availableStreams, stream]);
    };

  //   const removeStream = (streamId) => {
  //     const updatedStreams = availableStreams.filter((stream) => stream.id !== streamId);
  //     setAvailableStreams(updatedStreams);
  //   };

  return (
    <PeerContext.Provider value={{ availableStreams, peer }}>
      {children}
    </PeerContext.Provider>
  );
};

