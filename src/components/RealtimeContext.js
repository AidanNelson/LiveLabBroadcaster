"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { RoomEvent } from "livekit-client";
import { useLivekitRoom } from "@/hooks/useLivekitRoom";
import { useSignalingSocket } from "@/hooks/useSignalingSocket";
import { useStageContext } from "@/components/StageContext";
import debug from "debug";
const logger = debug("broadcaster:realtimeContextProvider");

export const RealtimeContext = createContext();

export const RealtimeContextProvider = ({
  isLobby = false,
  isAudience = true,
  children,
}) => {
  const { stageInfo } = useStageContext();

  const roomId = stageInfo?.id ? (isLobby ? stageInfo.id + "-lobby" : stageInfo.id) : null;

  const { room } = useLivekitRoom({ roomId });

  const { socket } = useSignalingSocket({
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
    roomId,
  });

  const [broadcastVideoStream, setBroadcastVideoStream] = useState(null);
  const [broadcastAudioStream, setBroadcastAudioStream] = useState(null);

  useEffect(() => {
    setBroadcastVideoStream(new MediaStream());
    setBroadcastAudioStream(new MediaStream());
  }, []);

  const [peerVideoStreams, setPeerVideoStreams] = useState({});
  const [peerAudioStreams, setPeerAudioStreams] = useState({});

  useEffect(() => {
    window.broadcastVideoStream = broadcastVideoStream;
  }, [broadcastVideoStream]);

  useEffect(() => {
    window.broadcastAudioStream = broadcastAudioStream;
  }, [broadcastAudioStream]);

  useEffect(() => {
    if (!socket || !isAudience) return;

    const pulseInterval = setInterval(
      () => socket.emit("pulse", roomId),
      2000,
    );
    return () => clearInterval(pulseInterval);
  }, [socket, isAudience, roomId]);

  useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (track, publication, participant) => {
      const trackName = publication.trackName;
      let peerId = participant.identity;
      try {
        const meta = JSON.parse(participant.metadata || "{}");
        if (meta.userId) peerId = meta.userId;
      } catch {}
      const stream = new MediaStream([track.mediaStreamTrack]);

      logger(
        `Received track [${trackName}] kind [${track.kind}] from [${peerId}]`,
      );

      if (trackName === "video-broadcast") {
        setBroadcastVideoStream((prev) => {
          prev?.getVideoTracks().forEach((t) => t.stop());
          return stream;
        });
      } else if (trackName === "audio-broadcast") {
        setBroadcastAudioStream((prev) => {
          prev?.getAudioTracks().forEach((t) => t.stop());
          return stream;
        });
      } else if (trackName === "peer-video") {
        setPeerVideoStreams((prev) => ({ ...prev, [peerId]: stream }));
      } else if (trackName === "peer-audio") {
        setPeerAudioStreams((prev) => ({ ...prev, [peerId]: stream }));
      }
    };

    const handleTrackUnsubscribed = (track, publication, participant) => {
      const trackName = publication.trackName;
      let peerId = participant.identity;
      try {
        const meta = JSON.parse(participant.metadata || "{}");
        if (meta.userId) peerId = meta.userId;
      } catch {}

      logger(`Track unsubscribed [${trackName}] from [${peerId}]`);

      if (trackName === "video-broadcast") {
        setBroadcastVideoStream(new MediaStream());
      } else if (trackName === "audio-broadcast") {
        setBroadcastAudioStream(new MediaStream());
      } else if (trackName === "peer-video") {
        setPeerVideoStreams((prev) => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      } else if (trackName === "peer-audio") {
        setPeerAudioStreams((prev) => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      }
    };

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    };
  }, [room]);

  return (
    <RealtimeContext.Provider
      value={{
        room,
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
