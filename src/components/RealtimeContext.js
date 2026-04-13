"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const { stageInfo, features } = useStageContext();

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
  const lastVideoQualityByTrackSid = useRef(new Map());

  useEffect(() => {
    if (!room) return;

    const ensureBroadcastSubscriptions = () => {
      for (const participant of room.remoteParticipants.values()) {
        for (const publication of participant.trackPublications.values()) {
          if (!parseBroadcastTrackName(publication.trackName)) continue;
          if (!publication.isSubscribed) {
            publication.setSubscribed(true);
          }
        }
      }
    };

    ensureBroadcastSubscriptions();
    room.on(RoomEvent.ParticipantConnected, ensureBroadcastSubscriptions);
    room.on(RoomEvent.TrackPublished, ensureBroadcastSubscriptions);

    return () => {
      room.off(RoomEvent.ParticipantConnected, ensureBroadcastSubscriptions);
      room.off(RoomEvent.TrackPublished, ensureBroadcastSubscriptions);
    };
  }, [room]);

  /**
   * selectedStreamId is always one of the active broadcast *features* (stage editor), for audience
   * and non-audience. Sinks without a LiveKit feed stay blank until someone publishes.
   */
  useEffect(() => {
    const activeSinkIds = features
      .filter((f) => f.type === "broadcastStream" && f.active)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((f) => String(f.id));

    if (activeSinkIds.length === 0) {
      if (selectedStreamId != null) setSelectedStreamId(null);
      return;
    }

    const sel = selectedStreamId != null ? String(selectedStreamId) : null;
    const inActive = sel != null && activeSinkIds.includes(sel);

    if (sel == null || !inActive) {
      const next = activeSinkIds[0];
      if (String(next) !== String(selectedStreamId ?? "")) {
        setSelectedStreamId(next);
      }
    }
  }, [features, selectedStreamId]);

  useEffect(() => {
    const seenSids = new Set();
    for (const [streamId, entry] of Object.entries(broadcastStreams)) {
      if (!entry.videoPublication) continue;
      const pub = entry.videoPublication;
      const sid = pub.trackSid;
      seenSids.add(sid);
      const desired =
        streamId === selectedStreamId ? VideoQuality.HIGH : VideoQuality.LOW;
      if (lastVideoQualityByTrackSid.current.get(sid) === desired) continue;
      try {
        pub.setVideoQuality(desired);
        lastVideoQualityByTrackSid.current.set(sid, desired);
      } catch {}
    }
    for (const sid of lastVideoQualityByTrackSid.current.keys()) {
      if (!seenSids.has(sid)) lastVideoQualityByTrackSid.current.delete(sid);
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
          if (entry.videoPublication === publication) return prev;
          return { ...prev, [streamId]: { ...entry, video: stream, videoPublication: publication } };
        }
        if (entry.audio && entry.audio.getAudioTracks()[0] === track.mediaStreamTrack) {
          return prev;
        }
        return { ...prev, [streamId]: { ...entry, audio: stream } };
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
