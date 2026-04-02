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
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
const logger = debug("broadcaster:streamPage");

function getBandwidthDefault() {
  return 3000;
}

const StreamControls = ({ isStreaming, setIsStreaming }) => {
  const { localStream, setUseAudioProcessing } = useUserMediaContext();

  useEffect(() => {
    if (!setUseAudioProcessing) return;
    setUseAudioProcessing(false);
  }, [setUseAudioProcessing]);

  const [bandwidth, setBandwidth] = useState(getBandwidthDefault);

  const { room } = useRealtimeContext();

  const publishedTracksRef = useRef({ video: null, audio: null });

  const startBroadcast = useCallback(async () => {
    if (!room) return;
    logger("Starting broadcast!");

    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const pub = await room.localParticipant.publishTrack(videoTrack, {
        name: "video-broadcast",
        videoEncoding: { maxBitrate: bandwidth * 1000 },
      });
      publishedTracksRef.current.video = pub;
    }

    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const pub = await room.localParticipant.publishTrack(audioTrack, {
        name: "audio-broadcast",
      });
      publishedTracksRef.current.audio = pub;
    }

    setIsStreaming(true);
  }, [localStream, room, bandwidth]);

  const stopBroadcast = useCallback(() => {
    if (!room) return;
    logger("Stopping broadcast!");

    const { video, audio } = publishedTracksRef.current;
    if (video) {
      room.localParticipant.unpublishTrack(video.track);
      publishedTracksRef.current.video = null;
    }
    if (audio) {
      room.localParticipant.unpublishTrack(audio.track);
      publishedTracksRef.current.audio = null;
    }

    setIsStreaming(false);
  }, [room]);

  return (
    <>
      <div className="flex flex-col items-center p-4 w-full h-full">
        <Typography variant="subtitle">Video Settings</Typography>
        <MediaDeviceSelector disabled={isStreaming} />
        <div className="py-12 flex flex-col items-center w-full">
          <Label className="text-sm mb-4" htmlFor="bandwidth">
            Bandwidth: {bandwidth} Kbps
          </Label>
          <Slider
            disabled={isStreaming}
            id="bandwidth"
            min={100}
            max={10000}
            value={[bandwidth]}
            onValueChange={(value) => setBandwidth(value[0])}
            className="w-[80%] max-w-sm"
          />
        </div>

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
