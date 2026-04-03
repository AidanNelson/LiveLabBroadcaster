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

    const restartPlayback = () => {
      if (!el.srcObject) return;
      if (el.paused) el.play().catch(() => {});
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") restartPlayback();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", restartPlayback);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", restartPlayback);
    };
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

    const restartPlayback = () => {
      if (!el.srcObject) return;
      const src = el.srcObject;
      el.srcObject = null;
      el.srcObject = src;
      el.play().catch(() => {});
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") restartPlayback();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", restartPlayback);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", restartPlayback);
    };
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
      ref={videoRef}
    ></video>
  );
};
