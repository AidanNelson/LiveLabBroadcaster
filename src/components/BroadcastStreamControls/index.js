"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";
import Typography from "@/components/Typography";
import { useUserMediaContext } from "@/components/UserMediaContext";
import {
  RealtimeContextProvider,
  useRealtimeContext,
  parseBroadcastTrackName,
} from "@/components/RealtimeContext";
import { useStageContext } from "@/components/StageContext";
import debug from "debug";
import { RoomEvent } from "livekit-client";
import { ThreePanelLayout } from "../ThreePanelLayout";
import { Button, LongPressButton } from "../Button";
import { settleLocalMediaStream } from "@/utils/waitForLocalMediaReady";
const logger = debug("broadcaster:streamPage");

const BROADCAST_BITRATE = 3_000_000;

/** Shown where the browser allows it; Chrome usually replaces this with a generic reload warning. */
const BROADCAST_BEFORE_UNLOAD_MESSAGE =
  "Are you sure? Your active broadcast will be stopped when you reload this page.";
/** Fallback poll if a room event is missed; occupancy usually updates immediately from TrackPublished / TrackUnpublished / ParticipantConnected / ParticipantDisconnected. */
const OCCUPANCY_POLL_MS = 1000;

function useStreamOccupancy(room, broadcastStreamFeatures) {
  const [occupancy, setOccupancy] = useState({});

  useEffect(() => {
    if (!room) return;

    const broadcastIds = new Set(broadcastStreamFeatures.map((f) => f.id));

    const computeOccupancy = () => {
      const result = {};

      for (const p of room.remoteParticipants.values()) {
        for (const pub of p.trackPublications.values()) {
          const parsed = parseBroadcastTrackName(pub.trackName);
          if (parsed?.kind !== "video") continue;
          if (!broadcastIds.has(parsed.streamId)) continue;
          result[parsed.streamId] = true;
        }
      }
      setOccupancy(result);
    };

    computeOccupancy();

    const onRoomChange = () => computeOccupancy();
    room.on(RoomEvent.TrackPublished, onRoomChange);
    room.on(RoomEvent.TrackUnpublished, onRoomChange);
    room.on(RoomEvent.ParticipantConnected, onRoomChange);
    room.on(RoomEvent.ParticipantDisconnected, onRoomChange);

    const interval = setInterval(computeOccupancy, OCCUPANCY_POLL_MS);
    return () => {
      clearInterval(interval);
      room.off(RoomEvent.TrackPublished, onRoomChange);
      room.off(RoomEvent.TrackUnpublished, onRoomChange);
      room.off(RoomEvent.ParticipantConnected, onRoomChange);
      room.off(RoomEvent.ParticipantDisconnected, onRoomChange);
    };
  }, [room, broadcastStreamFeatures]);

  return occupancy;
}

const StreamControls = ({ isStreaming, setIsStreaming }) => {
  const { localStream, isLocalMediaReady, setUseAudioProcessing } = useUserMediaContext();
  const { features } = useStageContext();

  useEffect(() => {
    if (!setUseAudioProcessing) return;
    setUseAudioProcessing(false);
  }, [setUseAudioProcessing]);

  const { room } = useRealtimeContext();

  const broadcastStreamFeatures = useMemo(
    () => features.filter((f) => f.type === "broadcastStream"),
    [features],
  );

  const [selectedSinkId, setSelectedSinkId] = useState(null);

  useEffect(() => {
    if (
      !selectedSinkId &&
      broadcastStreamFeatures.length > 0
    ) {
      setSelectedSinkId(broadcastStreamFeatures[0].id);
    }
  }, [broadcastStreamFeatures, selectedSinkId]);

  const occupancy = useStreamOccupancy(room, broadcastStreamFeatures);

  const publishedTracksRef = useRef({ video: null, audio: null });
  const isPublishingRef = useRef(false);
  const localStreamRef = useRef(localStream);
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Sync isStreaming with actual Room state (survives HMR where state resets but Room persists)
  useEffect(() => {
    if (!room) return;
    for (const pub of room.localParticipant.trackPublications.values()) {
      const parsed = parseBroadcastTrackName(pub.trackName);
      if (parsed?.kind === "video") {
        publishedTracksRef.current.video = pub;
        setIsStreaming(true);
        setSelectedSinkId(parsed.streamId);
      }
      if (parsed?.kind === "audio") {
        publishedTracksRef.current.audio = pub;
      }
    }
  }, [room]);

  useEffect(() => {
    if (!room && isStreaming) {
      logger("Room disconnected while streaming — resetting broadcast state");
      publishedTracksRef.current = { video: null, audio: null };
      isPublishingRef.current = false;
      setIsStreaming(false);
    }
  }, [room, isStreaming, setIsStreaming]);

  const startBroadcast = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!room || !stream || !selectedSinkId || isPublishingRef.current) return;
    isPublishingRef.current = true;
    logger("Starting broadcast on sink:", selectedSinkId);

    try {
      await settleLocalMediaStream(stream);

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        const pub = await room.localParticipant.publishTrack(videoTrack, {
          name: `video-broadcast-${selectedSinkId}`,
          videoEncoding: {
            maxBitrate: BROADCAST_BITRATE,
            maxFramerate: 30,
          },
          simulcast: true,
          videoSimulcastLayers: [
            { width: 640, height: 360, encoding: { maxBitrate: 500_000, maxFramerate: 20 } },
            { width: 320, height: 180, encoding: { maxBitrate: 150_000, maxFramerate: 15 } },
          ],
        });
        publishedTracksRef.current.video = pub;
      }

      if (audioTrack) {
        const pub = await room.localParticipant.publishTrack(audioTrack, {
          name: `audio-broadcast-${selectedSinkId}`,
          audioBitrate: 128_000,
          dtx: false,
          red: true,
        });
        publishedTracksRef.current.audio = pub;
      }

      setIsStreaming(true);
    } catch (err) {
      console.error("Failed to publish broadcast tracks:", err?.message || err);
      const { video, audio } = publishedTracksRef.current;
      if (video?.track) {
        try { room.localParticipant.unpublishTrack(video.track, false); } catch {}
      }
      if (audio?.track) {
        try { room.localParticipant.unpublishTrack(audio.track, false); } catch {}
      }
      publishedTracksRef.current = { video: null, audio: null };
      setIsStreaming(false);
    } finally {
      isPublishingRef.current = false;
    }
  }, [room, selectedSinkId]);

  const stopBroadcast = useCallback(() => {
    if (!room) return;
    logger("Stopping broadcast!");

    const { video, audio } = publishedTracksRef.current;
    if (video) {
      try { room.localParticipant.unpublishTrack(video.track, false); } catch {}
      publishedTracksRef.current.video = null;
    }
    if (audio) {
      try { room.localParticipant.unpublishTrack(audio.track, false); } catch {}
      publishedTracksRef.current.audio = null;
    }

    setIsStreaming(false);
  }, [room]);

  const selectedSinkOccupied = Boolean(selectedSinkId && occupancy[selectedSinkId]);

  const startBlocked =
    !selectedSinkId ||
    broadcastStreamFeatures.length === 0 ||
    !localStream ||
    !isLocalMediaReady;

  return (
    <>
      <div className="flex flex-col items-center p-4 w-full h-full">
        <Typography variant="subheading" className="w-full text-left">
          Device Selection
        </Typography>
        <MediaDeviceSelector disabled={isStreaming} />

        <div className="py-4" />
        <Typography variant="subheading" className="w-full text-left">
          Stream Selection
        </Typography>
        {broadcastStreamFeatures.length === 0 ? (
          <Typography variant="body3" style={{ color: "var(--ui-light-grey)", marginTop: "8px" }}>
            No broadcast streams configured. Add one from the Stage page.
          </Typography>
        ) : (
          <div className="flex flex-col gap-2 w-full mt-2">
            {broadcastStreamFeatures.map((feat) => (
              <button
                key={feat.id}
                disabled={isStreaming}
                onClick={() => setSelectedSinkId(feat.id)}
                style={{
                  padding: "8px 12px",
                  border: selectedSinkId === feat.id
                    ? "2px solid white"
                    : "1px solid var(--ui-light-grey)",
                  borderRadius: "5px",
                  backgroundColor: selectedSinkId === feat.id
                    ? "#333333aa"
                    : "#00000055",
                  color: "white",
                  cursor: isStreaming ? "not-allowed" : "pointer",
                  opacity: isStreaming && selectedSinkId !== feat.id ? 0.5 : 1,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{feat.name || feat.id}</span>
                {occupancy[feat.id] && (
                  <span style={{ fontSize: "0.75rem", color: "#ff9900" }}>
                    In Use
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {broadcastStreamFeatures.length > 0 ? (
          <div
            className="w-full mt-2"
            style={{
              minHeight: "5.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: "6px",
            }}
          >
            {selectedSinkOccupied && !isStreaming && (
              <Typography variant="body3" style={{ color: "#ff9900" }}>
                Warning: This stream is in use. Starting will replace the existing feed.
              </Typography>
            )}
            {!isStreaming && localStream && !isLocalMediaReady && (
              <Typography variant="body3" style={{ color: "var(--ui-light-grey)" }}>
                Preparing camera and microphone…
              </Typography>
            )}
          </div>
        ) : null}

        <div className="py-4" />
        {isStreaming ? (
          <Button
            className="buttonLarge"
            id="startBroadcast"
            disabled={!selectedSinkId || broadcastStreamFeatures.length === 0}
            onClick={stopBroadcast}
          >
            <Typography variant="buttonLarge">Stop Broadcast</Typography>
          </Button>
        ) : selectedSinkOccupied ? (
          <LongPressButton
            className="buttonLarge"
            id="startBroadcast"
            disabled={startBlocked}
            holdDurationMs={2000}
            onLongPressComplete={startBroadcast}
            title={
              !isLocalMediaReady && localStream
                ? "Wait until camera and microphone are ready"
                : "Hold for 2 seconds to start and replace the feed in use"
            }
          >
            <Typography variant="buttonLarge">Start Broadcast</Typography>
          </LongPressButton>
        ) : (
          <Button
            className="buttonLarge"
            id="startBroadcast"
            disabled={startBlocked}
            onClick={startBroadcast}
          >
            <Typography variant="buttonLarge">Start Broadcast</Typography>
          </Button>
        )}
      </div>
    </>
  );
};

const VideoPreview = ({ isStreaming }) => {
  const { localStream } = useUserMediaContext();

  const videoPreviewRef = useRef();
  useEffect(() => {
    if (!localStream) return;
    logger(localStream.getVideoTracks()[0].getSettings());

    if ("srcObject" in videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = localStream;
    } else {
      videoPreviewRef.current.src = window.URL.createObjectURL(localStream);
    }
    videoPreviewRef.current.onloadedmetadata = (e) => {
      videoPreviewRef.current.play().catch((e) => {
        console.error("Play Error: " + e);
      });
    };
  }, [localStream]);
  return (
    <video
      ref={videoPreviewRef}
      muted
      autoPlay
      className={`max-w-full max-h-full object-contain mx-auto ${
        isStreaming ? `border-8 border-red-500` : `border-none`
      }`}
    />
  );
};
export const BroadcastInner = () => {
  const { setHasRequestedMediaDevices } = useUserMediaContext();

  useEffect(() => {
    setHasRequestedMediaDevices(true);
  }, []);

  const [isStreaming, setIsStreaming] = useState(false);
  const isStreamingRef = useRef(false);
  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isStreamingRef.current) return;
      event.preventDefault();
      event.returnValue = BROADCAST_BEFORE_UNLOAD_MESSAGE;
    };

    const handleLinkClick = (event) => {
      if (!isStreamingRef.current) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

      const target = event.target.closest("a[href]");
      if (!target || !target.href) return;
      if (target.href.startsWith(window.location.origin + window.location.pathname)) return;
      if (target.target === "_blank") return;

      if (!window.confirm(BROADCAST_BEFORE_UNLOAD_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (!isStreamingRef.current) return;
      if (!window.confirm(BROADCAST_BEFORE_UNLOAD_MESSAGE)) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <>
      <ThreePanelLayout
        left={
          <StreamControls
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />
        }
        rightTop={<VideoPreview isStreaming={isStreaming} />}
        rightBottom={<div />}
      />
    </>
  );
};

export const BroadcastStreamControls = ({ params }) => {
  return <BroadcastInner params={params} />;
};
