"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";
import Typography from "@/components/Typography";
import { useUserMediaContext } from "@/components/UserMediaContext";
import {
  RealtimeContextProvider,
  useRealtimeContext,
} from "@/components/RealtimeContext";
import { useUserInteractionContext } from "@/components/UserInteractionContext";
import debug from "debug";
import { ThreePanelLayout } from "../ThreePanelLayout";
import { Button } from "../Button";
const logger = debug("broadcaster:streamPage");

const BROADCAST_BITRATE = 3_000_000;

const StreamControls = ({ isStreaming, setIsStreaming }) => {
  const { localStream, setUseAudioProcessing } = useUserMediaContext();

  useEffect(() => {
    if (!setUseAudioProcessing) return;
    setUseAudioProcessing(false);
  }, [setUseAudioProcessing]);

  const { room } = useRealtimeContext();

  const publishedTracksRef = useRef({ video: null, audio: null });
  const isPublishingRef = useRef(false);

  useEffect(() => {
    if (!room && isStreaming) {
      logger("Room disconnected while streaming — resetting broadcast state");
      publishedTracksRef.current = { video: null, audio: null };
      isPublishingRef.current = false;
      setIsStreaming(false);
    }
  }, [room, isStreaming, setIsStreaming]);

  const startBroadcast = useCallback(async () => {
    if (!room || !localStream || isPublishingRef.current) return;
    isPublishingRef.current = true;
    logger("Starting broadcast!");

    try {
      let videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const pub = await room.localParticipant.publishTrack(videoTrack, {
          name: "video-broadcast",
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

      let audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const pub = await room.localParticipant.publishTrack(audioTrack, {
          name: "audio-broadcast",
          audioBitrate: 128_000,
          dtx: false,
          red: true,
        });
        publishedTracksRef.current.audio = pub;
      }

      setIsStreaming(true);
    } catch (err) {
      console.error("Failed to publish broadcast tracks:", err);
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
  }, [localStream, room]);

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

  return (
    <>
      <div className="flex flex-col items-center p-4 w-full h-full">
        <Typography variant="subtitle">Video Settings</Typography>
        <MediaDeviceSelector disabled={isStreaming} />
        <div className="py-12" />
        <Button
          className="buttonLarge"
          id="startBroadcast"
          onClick={() => {
            if (isStreaming) {
              stopBroadcast();
            } else {
              startBroadcast();
            }
          }}
        >
          <Typography variant="buttonLarge">
            {isStreaming ? "Stop Broadcast" : "Start Broadcast"}
          </Typography>
        </Button>
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
  const { hasInteracted } = useUserInteractionContext();

  return (
    <>
      {!hasInteracted && (
        <Button variant="buttonLarge">
          <Typography variant="buttonLarge">Enter Broadcaster</Typography>
        </Button>
      )}
      {hasInteracted && <BroadcastInner params={params} />}
    </>
  );
};
