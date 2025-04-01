"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";
import Typography from "@/components/Typography";
import { useUserMediaContext } from "@/components/UserMediaContext";
import { useRealtimeContext } from "@/components/RealtimeContext";

function getBandwidthDefault() {
  return 3000;
}
function BroadcastInner() {
  const { localStream } = useUserMediaContext();

  const [bandwidth, setBandwidth] = useState(getBandwidthDefault);
  const [isStreaming, setIsStreaming] = useState(false);

  const { peer } = useRealtimeContext();

  const videoPreviewRef = useRef();

  const startBroadcast = useCallback(() => {
    if (!peer) return;
    console.log("Starting broadcast!");

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
    console.log("Stopping broadcast!");
    peer.producers["video-broadcast"].close();
    peer.producers["audio-broadcast"].close();
    setIsStreaming(false);
  }, [peer]);

  useEffect(() => {
    if (!localStream) return;
    console.log(localStream.getVideoTracks()[0].getSettings());

    if ("srcObject" in videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = localStream;
    } else {
      videoPreviewRef.current.src = window.URL.createObjectURL(localStream);
    }
    videoPreviewRef.current.onloadedmetadata = (e) => {
      videoPreviewRef.current.play().catch((e) => {
        console.log("Play Error: " + e);
      });
    };
  }, [localStream]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle">Video Preview</Typography>
        <video
          ref={videoPreviewRef}
          muted
          autoPlay
          style={{ maxWidth: "50vw", border: isStreaming? "10px solid red" : "10px solid black" }}
        />
      </div>

      <div
        style={{
          display: isStreaming ? "none" : "flex",
          flexDirection: "column",
        }}
      >
        <hr />
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
      </div>

      <hr />
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
}

export default function BroadcastPage({ params }) {
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
              setHasRequestedMediaDevices(true);
              setHasInteracted(true);
            }}
          >
            <Typography variant="buttonLarge">Enter Broadcaster</Typography>
          </button>
        )}
        {hasInteracted && <BroadcastInner params={params} />}
      </div>
    </>
  );
}
