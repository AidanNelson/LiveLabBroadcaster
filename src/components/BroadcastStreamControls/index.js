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

  const { peer } = useRealtimeContext();

  const startBroadcast = useCallback(() => {
    if (!peer) return;
    logger("Starting broadcast!");

    // add video track
    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const videoEncodings = [{ maxBitrate: bandwidth * 1000 }];
      peer.addTrack(videoTrack, "video-broadcast", true, videoEncodings);
    }

    // add audio track
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack(audioTrack, "audio-broadcast", true);
    }

    setIsStreaming(true);
  }, [localStream, peer, bandwidth]);

  const stopBroadcast = useCallback(() => {
    if (!peer) return;
    logger("Stopping broadcast!");
    peer.producers["video-broadcast"].close();
    peer.producers["audio-broadcast"].close();
    setIsStreaming(false);
  }, [peer]);

  return (
    <>
      <Typography variant="subtitle">Video Settings</Typography>
      <MediaDeviceSelector />
      <Typography variant="body1">
        Broadcast Bandwidth in Kbps ({getBandwidthDefault()} is default):{" "}
        {bandwidth}
      </Typography>
      <input
        type="range"
        min="100"
        max="10000"
        value={bandwidth}
        onChange={(e) => setBandwidth(e.target.value)}
      />

      <div
        style={{
          marginTop: "1rem",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
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
        </button>
      </div>
    </>
  );
};

const VideoPreview = ({ isStreaming }) => {
  const { localStream, setUseAudioProcessing } = useUserMediaContext();

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
      style={{
        maxWidth: "50vw",
        border: isStreaming ? "10px solid red" : "10px solid black",
      }}
    />
  );
};
function BroadcastInner() {
  useEffect(() => {
    setHasRequestedMediaDevices(true);
    setHasInteracted(true);
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
}

export const BroadcastStreamControls = ({ params }) => {
  const { hasInteracted: alreadyInteracted } = useUserInteractionContext();
  const [hasInteracted, setHasInteracted] = useState(false);
  const { setHasRequestedMediaDevices } = useUserMediaContext();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          // alignItems: "center",
          width: "80%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Typography variant="hero" style={{ textAlign: "center" }}>
          Broadcast
        </Typography>
        {!hasInteracted && (
          <button
            className="buttonLarge"
            onClick={() => {
              setHasInteracted(true);
              setHasRequestedMediaDevices(true);
            }}
          >
            <Typography variant="buttonLarge">Enter Broadcaster</Typography>
          </button>
        )}
        {hasInteracted && <BroadcastInner params={params} />}
      </div>
    </>
  );
};
