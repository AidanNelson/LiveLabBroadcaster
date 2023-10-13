// StreamProvider.js
import React, { createContext, useState, useEffect } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";

export const PeerContext = createContext();

export const PeerContextProvider = ({ children }) => {
  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: 'vvv',
    url: "http://localhost",
    port: 3030, 
  });

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
    <PeerContext.Provider value={{ availableStreams, socket }}>
      {children}
    </PeerContext.Provider>
  );
};

