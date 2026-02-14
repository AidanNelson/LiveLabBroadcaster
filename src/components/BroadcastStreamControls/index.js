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
import { useStageContext } from "@/components/StageContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

function getBandwidthDefault() {
  return 3000;
}

const StreamControls = ({ isStreaming, setIsStreaming }) => {
  const { stageInfo, features } = useStageContext();
  const { localStream, setUseAudioProcessing } = useUserMediaContext();

  const searchParams = useSearchParams();
  const streamId = searchParams.get("id") || null;

  const [broadcastSink, setBroadcastSink] = useState(null);
  const [broadcastSinks, setBroadcastSinks] = useState([]);

  useEffect(() => {
    if (!stageInfo || !features) return;
    const broadcastSinks = features.filter(
      (feature) => feature.type === "broadcastStream",
    );
    console.log("broadcastSinks", broadcastSinks);
    console.log("streamId", streamId);
    setBroadcastSinks(broadcastSinks);
    if (streamId) {
      console.log(
        "setting broadcast sink",
        broadcastSinks.find((sink) => sink.id === streamId)?.id,
      );
      setBroadcastSink(broadcastSinks.find((sink) => sink.id === streamId)?.id);
    }
  }, [stageInfo, features, streamId]);

  useEffect(() => {
    if (!setUseAudioProcessing) return;
    setUseAudioProcessing(false);
  }, [setUseAudioProcessing]);

  const [bandwidth, setBandwidth] = useState(getBandwidthDefault);

  const { peer } = useRealtimeContext();

  const startBroadcast = useCallback(() => {
    if (!peer) return;
    logger("Starting broadcast!");

    // add video track
    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const videoEncodings = [{ maxBitrate: bandwidth * 1000 }];
      peer.addTrack({
        track: videoTrack,
        label: broadcastSink + "-video",
        customEncodings: videoEncodings,
      });
    }

    // add audio track
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack({ track: audioTrack, label: broadcastSink + "-audio" });
    }

    setIsStreaming(true);
  }, [localStream, peer, bandwidth, broadcastSink]);

  const stopBroadcast = useCallback(() => {
    if (!peer) return;
    logger("Stopping broadcast!");
    peer.producers[broadcastSink + "-video"].close();
    peer.producers[broadcastSink + "-audio"].close();
    setIsStreaming(false);
  }, [peer, broadcastSink]);

  const updateBroadcastSink = (value) => {
    setBroadcastSink(value);
    // set search param for 'id' to the new value
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("id", value);
      window.history.replaceState({}, "", url);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center p-4 w-full h-full">
        <div className="w-full max-w-sm mb-8">
          <Select
            disabled={isStreaming}
            value={broadcastSink || ""}
            onValueChange={(value) => updateBroadcastSink(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose broadcast destination" />
            </SelectTrigger>
            <SelectContent>
              {broadcastSinks.map((sink) => (
                <SelectItem key={sink.id} value={sink.id}>
                  {sink.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          disabled={broadcastSink === null}
          onClick={() => {
            if (broadcastSink === null) {
              return;
            }
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
