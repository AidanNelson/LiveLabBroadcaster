"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { useStageContext } from "@/components/StageContext";
import { usePathname } from "next/navigation";
import debug from "debug";
const logger = debug("broadcaster:realtimeContextProvider");

export const RealtimeContext = createContext();

export const RealtimeContextProvider = ({ isLobby = false, children }) => {
  const { stageInfo } = useStageContext();

  const { peer, socket } = useRealtimePeer({
    autoConnect: true,
    roomId: isLobby ? stageInfo?.id + "-lobby" : stageInfo?.id,
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

      logger(
        `Received track of kind [${track.kind}] from peer [${peerId}] with label [${label}]`,
      );

      if (label === "video-broadcast") {
        broadcastVideoStream.getVideoTracks().forEach((videoTrack) => {
          videoTrack.stop();
        });
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

      // check for inactive streams every 500ms and reset or remove those streams as needed
      let checkInterval = setInterval(() => {
        if (!stream.active) {
          logger("Stream no longer active: ", stream);

          if (label === "video-broadcast") {
            setBroadcastVideoStream(new MediaStream());
            clearInterval(checkInterval);
          }
          if (label === "audio-broadcast") {
            setBroadcastAudioStream(new MediaStream());
            clearInterval(checkInterval);
          }
          if (label === "peer-video") {
            setPeerVideoStreams((prev) => {
              const newState = { ...prev };
              delete newState[peerId];
              return newState;
            });
            clearInterval(checkInterval);
          }
          if (label === "peer-audio") {
            setPeerAudioStreams((prev) => {
              const newState = { ...prev };
              delete newState[peerId];
              return newState;
            });
            clearInterval(checkInterval);
          }
        }
      }, 1000);

      // Store the interval ID so it can be cleared later
      stream.checkInterval = checkInterval;
    };

    peer.on("track", handleTrack);

    return () => {
      Object.values(peerVideoStreams).forEach((stream) =>
        clearInterval(stream.checkInterval),
      );
      Object.values(peerAudioStreams).forEach((stream) =>
        clearInterval(stream.checkInterval),
      );
      clearInterval(broadcastVideoStream.checkInterval);
      clearInterval(broadcastAudioStream.checkInterval);
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
