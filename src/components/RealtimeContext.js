import { createContext, useContext, useState, useEffect } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";

export const RealtimeContext = createContext();

export const RealtimeContextProvider = ({ roomId, children }) => {
  const { peer, socket } = useRealtimePeer({
    autoConnect: true,
    roomId: roomId,
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

  // useEffect(() => {
  //   window.peerVideoStreams = peerVideoStreams;
  //   console.log({ peerVideoStreams });
  // }, [peerVideoStreams])

  useEffect(() => {
    window.broadcastVideoStream = broadcastVideoStream;
  }, [broadcastVideoStream]);

  useEffect(() => {
    window.broadcastAudioStream = broadcastAudioStream;
  }, [broadcastAudioStream]);


  useEffect(() => {
    if (!peer) return;
    peer.on("track", ({ track, peerId, label }) => {
      const stream = new MediaStream([track]);

      console.log(
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

      // check for inactive streams every 500ms
      const checkInterval = setInterval(() => {
        if (!stream.active) {
          console.log("stream no longer active: ", stream);
          setPeerVideoStreams((prev) => {
            delete prev[peerId];
            return { ...prev };
          });
        }
      }, 500);

      return () => {
        clearInterval(checkInterval);
      };
    });

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
