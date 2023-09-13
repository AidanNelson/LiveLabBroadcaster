"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { peer } from "../mediaConnection";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";

export default function Broadcast() {
  const [initialized, setInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  const videoPreviewRef = useRef();

  const startBroadcast = useCallback(() => {
    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      peer.addTrack(videoTrack, "video-broadcast", true);
    }
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack(audioTrack, "audio-broadcast", true);
    }
  }, [localStream]);

  useEffect(() => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if ("srcObject" in videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = new MediaStream([videoTrack]);
    } else {
      videoPreviewRef.current.src = window.URL.createObjectURL(
        new MediaStream([videoTrack])
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
      <video ref={videoPreviewRef} />

      <button id="startBroadcast" onClick={startBroadcast}>
        Start Camera Broadcast
      </button>
    </>
  );
}
