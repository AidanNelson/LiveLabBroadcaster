"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { useStageContext } from "@/components/StageContext";

export const RealtimeContext = createContext();

export const RealtimeContextProvider = ({ roomId, children }) => {
  const { stageInfo } = useStageContext();
  const { peer, socket } = useRealtimePeer({
    autoConnect: true,
    roomId: stageInfo?.id,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  // we'll compose a broadcast stream from incoming tracks
  const [broadcastVideoStream, setBroadcastVideoStream] = useState(
    new MediaStream(),
  );
  const [broadcastAudioStream, setBroadcastAudioStream] = useState(
    new MediaStream(),
  );

  // same for peer streams
  const [peerVideoStreams, setPeerVideoStreams] = useState({});
  const [peerAudioStreams, setPeerAudioStreams] = useState({});

  useEffect(() => {
    window.broadcastVideoStream = broadcastVideoStream;
  }, [broadcastVideoStream]);

  useEffect(() => {
    window.broadcastAudioStream = broadcastAudioStream;
  }, [broadcastAudioStream]);

  useEffect(() => {
    if (!peer) return;

    const handleTrack = ({ track, peerId, label }) => {
      const stream = new MediaStream([track]);
  
      console.log(
        `Received track of kind [${track.kind}] from peer [${peerId}] with label [${label}]`,
      );
  
      if (label === "video-broadcast") {
        broadcastVideoStream.getVideoTracks().forEach((videoTrack) => {
          videoTrack.stop();
        });
        console.log('swapping broadcast stream!');
        setBroadcastVideoStream(stream);
      }
  
      if (label === "audio-broadcast") {
        broadcastAudioStream.getAudioTracks().forEach((audioTrack) => {
          audioTrack.stop();
        });
        setBroadcastAudioStream(stream);
      }
  
      if (label === "peer-video") {
        setPeerVideoStreams((prev) => {
          return { ...prev, [peerId]: stream };
        });
      }
      if (label === "peer-audio") {
        setPeerAudioStreams((prev) => {
          return { ...prev, [peerId]: stream };
        });
      }
  
      // check for inactive streams every 500ms
      const checkInterval = setInterval(() => {
        if (!stream.active) {
          console.log("stream no longer active: ", stream);
        }
      }, 500);
  
      // Store the interval ID so it can be cleared later
      stream.checkInterval = checkInterval;
    };
  
    peer.on("track", handleTrack);
  
    return () => {
      console.log('clearing old intervals');
      peer.off("track", handleTrack);
      // Clear all intervals
      Object.values(peerVideoStreams).forEach(stream => clearInterval(stream.checkInterval));
      Object.values(peerAudioStreams).forEach(stream => clearInterval(stream.checkInterval));
    };
  }, [
    peer,
    setBroadcastAudioStream,
    setBroadcastVideoStream,
    setPeerAudioStreams,
    setPeerVideoStreams,
  ]);

  return (
    <RealtimeContext.Provider
      value={{
        peer,
        socket,
        broadcastVideoStream,
        broadcastAudioStream,
        peerVideoStreams,
        peerAudioStreams,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtimeContext = () => {
  return useContext(RealtimeContext);
};
