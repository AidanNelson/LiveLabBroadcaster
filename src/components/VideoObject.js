import { useEffect, useRef, useMemo } from "react";
import { useRealtimeContext } from "./RealtimeContext";
import debug from "debug";
const logger = debug("broadcaster:broadcastMediaPlayers");

export const BroadcastAudioPlayer = () => {
  const audioRef = useRef();
  const { broadcastStreams, selectedStreamId } = useRealtimeContext();

  const audioStream = useMemo(
    () => broadcastStreams[selectedStreamId]?.audio,
    [broadcastStreams, selectedStreamId],
  );

  useEffect(() => {
    if (!audioRef.current || !audioStream || audioStream.getAudioTracks().length === 0) return;

    logger("Broadcast audio stream:", audioStream);
    audioRef.current.srcObject = audioStream;
    audioRef.current.onloadedmetadata = () => {
      audioRef.current.play().catch((e) => {
        console.error("Audio play Error: " + e);
      });
    };
  }, [audioStream]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onVisible = () => {
      if (document.visibilityState === "visible" && el.srcObject && el.paused) {
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

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
  const { broadcastStreams, selectedStreamId } = useRealtimeContext();

  const videoStream = useMemo(
    () => broadcastStreams[selectedStreamId]?.video,
    [broadcastStreams, selectedStreamId],
  );

  useEffect(() => {
    if (!videoRef.current || !videoStream || videoStream.getVideoTracks().length === 0) return;
    logger("Broadcast video stream:", videoStream);
    videoRef.current.srcObject = videoStream;
    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play().catch((e) => {
        console.error("Video play Error: " + e);
      });
    };
  }, [videoStream]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onVisible = () => {
      if (document.visibilityState === "visible" && el.srcObject && el.paused) {
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

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
