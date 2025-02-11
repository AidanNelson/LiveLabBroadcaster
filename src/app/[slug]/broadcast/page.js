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

  // const bandwidthIndicatorRef = useRef();
  const [bandwidth, setBandwidth] = useState(getBandwidthDefault);

  // console.log(params);
  const { peer } = useRealtimeContext();

  const videoPreviewRef = useRef();

  const startBroadcast = useCallback(() => {
    if (!peer) return;
    const videoTrackLabel = "video-broadcast";
    console.log("Starting broadcast!");
    console.log(localStream);
    const videoEncodings = [{ maxBitrate: bandwidth * 1000 }];
    console.log({ videoEncodings });
    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      if (peer.producers[videoTrackLabel]) {
        peer.producers[videoTrackLabel].close();
        delete peer.producers[videoTrackLabel];
        delete peer.tracksToProduce[videoTrackLabel];
        console.log("exists?", peer.producers[videoTrackLabel]);
      }
      console.log("Adding video track: ", videoTrack);
      peer.addTrack(videoTrack, videoTrackLabel, true, videoEncodings);
    }
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack(audioTrack, "audio-broadcast", true);
    }
    console.log(peer);
  }, [localStream, peer, bandwidth]);

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
      <Typography variant="h3">Broadcast to Venue</Typography>
      <br />
      <MediaDeviceSelector />
      <br />
      <video
        ref={videoPreviewRef}
        muted
        autoPlay
        style={{ maxWidth: "50vw" }}
      />
      <Typography>
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

      <button
        className="buttonLarge"
        id="startBroadcast"
        onClick={startBroadcast}
      >
        <Typography variant="buttonLarge">
          Start / Replace Broadcast Stream
        </Typography>
      </button>
    </>
  );
}

export default function BroadcastPage({ params }) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { setHasRequestedMediaDevices } = useUserMediaContext();

  return (
    <>
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
    </>
  );
}
