"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";

export default function Broadcast({ params }) {
  const [initialized, setInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [streamStatus, setStreamStatus ] = useState("Not Streaming");

  const bandwidthIndicatorRef = useRef();
  const [bandwidth, setBandwidth] = useState(2500);

  // console.log(params);
  const { peer } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ? 443 : 3030,
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
      videoPreviewRef.current.src = window.URL.createObjectURL(
        localStream
      );
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
          margin: "auto",
          marginTop: "1em",
          maxWidth: "80vw",
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h1>Broadcast to Venue</h1>
        {!initialized && (
          <button onClick={() => setInitialized(true)}>Start</button>
        )}
        {initialized && (
          <>
            {" "}
            <MediaDeviceSelector
              localStream={localStream}
              setLocalStream={setLocalStream}
            />
            <video
              ref={videoPreviewRef}
              muted
              autoPlay
              style={{ maxWidth: "50vw" }}
            />
            <br />
            <br />
            <div>
              <input
                type="range"
                id="bandwidth"
                name="bandwidth"
                min="100"
                max="7500"
                onChange={(e) => {
                  setBandwidth(e.target.value);
                }}
              />
              <label htmlFor="bandwidth">
                Desired stream bandwidth in Kbps ({bandwidth} is default):{" "}
                <span ref={bandwidthIndicatorRef}>{bandwidth}</span>
              </label>
            </div>
            <button id="startBroadcast" onClick={startBroadcast}>
              Start / Replace Broadcast Stream
            </button>
          </>
        )}
      </div>
    </>
  );
}
