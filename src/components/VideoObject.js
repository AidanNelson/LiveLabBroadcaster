import { useEffect, useRef } from "react";
import { useRealtimeContext } from "./RealtimeContext";
import debug from 'debug';
const logger = debug('broadcaster:broadcastMediaPlayers');

export const BroadcastAudioPlayer = () => {
  const audioRef = useRef();
  const { broadcastAudioStream } = useRealtimeContext();

  useEffect(() => {
    logger("Broadcast audio stream:", broadcastAudioStream);
    audioRef.current.srcObject = broadcastAudioStream;
    audioRef.current.onloadedmetadata = (e) => {
      audioRef.current.play().catch((e) => {
        console.error("Audio play Error: " + e);
      });
    };
  }, [broadcastAudioStream]);

  return (
    <audio
      style={{
        top: "0px",
        left: "0px",
        position: "absolute",
        display: "none",
      }}
      playsInline
      autoPlay
      ref={audioRef}
    ></audio>
  );
};

export const BroadcastVideoSurface = () => {
  const videoRef = useRef();
  const { broadcastVideoStream } = useRealtimeContext();

  useEffect(() => {
    if (!videoRef.current) return;
    logger("Broadcast video stream:", broadcastVideoStream);
    videoRef.current.srcObject = broadcastVideoStream;
    videoRef.current.onloadedmetadata = (e) => {
      videoRef.current.play().catch((e) => {
        console.error("Video play Error: " + e);
      });
    };
  }, [broadcastVideoStream]);

  return (
    <video
      style={{
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      playsInline
      autoPlay
      muted
      loop
      ref={videoRef}
    ></video>
  );
};