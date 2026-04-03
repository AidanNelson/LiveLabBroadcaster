"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { RoomEvent, VideoQuality } from "livekit-client";
import { useLivekitRoom } from "@/hooks/useLivekitRoom";
import { useSignalingSocket } from "@/hooks/useSignalingSocket";
import { useStageContext } from "@/components/StageContext";
import debug from "debug";
const logger = debug("broadcaster:realtimeContextProvider");

export const VIDEO_PREFIX = "video-broadcast-";
export const AUDIO_PREFIX = "audio-broadcast-";

export function parseBroadcastTrackName(trackName) {
  if (trackName.startsWith(VIDEO_PREFIX)) {
    return { kind: "video", streamId: trackName.slice(VIDEO_PREFIX.length) };
  }
  if (trackName.startsWith(AUDIO_PREFIX)) {
    return { kind: "audio", streamId: trackName.slice(AUDIO_PREFIX.length) };
  }
  return null;
}

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

  // { [streamId]: { video: MediaStream | null, audio: MediaStream | null, videoPublication: RemoteTrackPublication | null } }
  const [broadcastStreams, setBroadcastStreams] = useState({});
  const [selectedStreamId, setSelectedStreamId] = useState(null);

  useEffect(() => {
    const ids = Object.keys(broadcastStreams);
    if (!selectedStreamId && ids.length > 0) {
      setSelectedStreamId(ids[0]);
    }
  }, [broadcastStreams, selectedStreamId]);

  useEffect(() => {
    for (const [streamId, entry] of Object.entries(broadcastStreams)) {
      if (entry.videoPublication) {
        try {
          if (streamId === selectedStreamId) {
            entry.videoPublication.setVideoQuality(VideoQuality.HIGH);
          } else {
            entry.videoPublication.setVideoQuality(VideoQuality.LOW);
          }
        } catch {}
      }
    }
  }, [selectedStreamId, broadcastStreams]);

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
      const parsed = parseBroadcastTrackName(trackName);
      if (!parsed) return;

      const { kind, streamId } = parsed;
      const stream = new MediaStream([track.mediaStreamTrack]);

      logger(`Broadcast track subscribed [${trackName}] kind [${kind}] streamId [${streamId}]`);

      setBroadcastStreams((prev) => {
        const entry = prev[streamId] || { video: null, audio: null, videoPublication: null };
        if (kind === "video") {
          return { ...prev, [streamId]: { ...entry, video: stream, videoPublication: publication } };
        } else {
          return { ...prev, [streamId]: { ...entry, audio: stream } };
        }
      });
    };

    const handleTrackUnsubscribed = (track, publication, participant) => {
      const trackName = publication.trackName;
      const parsed = parseBroadcastTrackName(trackName);
      if (!parsed) return;

      const { kind, streamId } = parsed;
      logger(`Broadcast track unsubscribed [${trackName}] kind [${kind}] streamId [${streamId}]`);

      setBroadcastStreams((prev) => {
        const entry = prev[streamId];
        if (!entry) return prev;

        if (kind === "video") {
          const updated = { ...entry, video: null, videoPublication: null };
          if (!updated.audio) {
            const next = { ...prev };
            delete next[streamId];
            return next;
          }
          return { ...prev, [streamId]: updated };
        } else {
          const updated = { ...entry, audio: null };
          if (!updated.video) {
            const next = { ...prev };
            delete next[streamId];
            return next;
          }
          return { ...prev, [streamId]: updated };
        }
      });
    };

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.trackPublications.values()) {
        if (publication.track && publication.isSubscribed) {
          handleTrackSubscribed(publication.track, publication, participant);
        }
      }
    }

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
        broadcastStreams,
        selectedStreamId,
        setSelectedStreamId,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtimeContext = () => {
  return useContext(RealtimeContext);
};
