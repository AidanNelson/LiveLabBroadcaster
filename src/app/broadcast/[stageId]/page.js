"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MediaDeviceSelector } from "../../../components/MediaDeviceSelector";
import { useSimpleMediasoupPeer } from "../../../hooks/useSimpleMediasoupPeer";

function getBandwidthDefault() {
  return 3000;
}
function BroadcastInner({ params }) {
  const [initialized, setInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [streamStatus, setStreamStatus] = useState("Not Streaming");

  const bandwidthIndicatorRef = useRef();
  const [bandwidth, setBandwidth] = useState(getBandwidthDefault);

  // console.log(params);
  const { peer } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

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
      console.log(peer.producers[videoTrackLabel]);
      console.log("adding video track");
      peer.addTrack(videoTrack, videoTrackLabel, true, videoEncodings);
    }
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack(audioTrack, "audio-broadcast", true);
    }
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
      Broadcast to Venue
      <br />
      <MediaDeviceSelector
        localStream={localStream}
        setLocalStream={setLocalStream}
      />
      <br />
      <div>
        <div item xs={6}>
          <video
            ref={videoPreviewRef}
            muted
            autoPlay
            style={{ maxWidth: "50vw" }}
          />
        </div>
      </div>
      <p id="input-slider" gutterBottom>
        Broadcast Bandwidth in Kbps ({getBandwidthDefault()} is default):{" "}
        {bandwidth}
      </p>
      {/* <Slider
            size="small"
            defaultValue={bandwidth}
            aria-label="Small"
            valueLabelDisplay="auto"
            min={100}
            max={10000}
            onChange={(e) => {
              setBandwidth(e.target.value);
            }}
            aria-labelledby="input-slider"
          /> */}
      <button
        variant="text"
        size="large"
        id="startBroadcast"
        onClick={startBroadcast}
      >
        Start / Replace Broadcast Stream
      </button>
    </>
  );
}

export default function MyPage({ params }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      {!hasInteracted && (
        <button
          onClick={() => setHasInteracted(true)}
          variant="text"
          size="large"
        >
          Enter Broadcaster
        </button>
      )}
      {hasInteracted && <BroadcastInner params={params} />}
    </>
  );
}
