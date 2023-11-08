"use client";


import { useEffect, useState, useRef, useCallback } from "react";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";

export default function Broadcast({ params }) {
  const [initialized, setInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  console.log(params);
  const { peer } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: params.stageId,
    url: process.env.NODE_ENV === "production"? process.env.REALTIME_SERVER_ADDRESS : "http://localhost",
    port: process.env.NODE_ENV === "production"? 443 : 3030,
  });

  const videoPreviewRef = useRef();

  const startBroadcast = useCallback(() => {
    console.log("Starting broadcast!");
    console.log(localStream);
    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      console.log('adding video track');
      peer.addTrack(videoTrack, "video-broadcast", true);
    }
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack(audioTrack, "audio-broadcast", true);
    }
  }, [localStream, peer]);

  useEffect(() => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if ("srcObject" in videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = new MediaStream([videoTrack]);
    } else {
      videoPreviewRef.current.src = window.URL.createObjectURL(
        new MediaStream([videoTrack]),
      );
    }

    videoPreviewRef.current.play();
  }, [localStream]);

  return (
    <>
      <MediaDeviceSelector
        localStream={localStream}
        setLocalStream={setLocalStream}
      />
      <video ref={videoPreviewRef} style={{ maxWidth: "50vw" }} />

      <button id="startBroadcast" onClick={startBroadcast}>
        Start Camera Broadcast
      </button>
    </>
  );
}
