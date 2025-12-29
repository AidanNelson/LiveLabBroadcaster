import { useEffect, useRef, useState } from "react";
import { useRealtimeContext } from "./RealtimeContext";
import { useUserInteractionContext } from "./UserInteractionContext";
import debug from "debug";
const logger = debug("broadcaster:broadcastMediaPlayers");


export const BroadcastStream = ({ info }) => {
  const { hasInteracted } = useUserInteractionContext();
  return (
    <>
      <BroadcastVideoSurface id={info.id} />
      {hasInteracted && <BroadcastAudioPlayer id={info.id} />}
    </>
  );
};

export const BroadcastAudioPlayer = () => {
  const audioRef = useRef();
  const { broadcastAudioStream } = useRealtimeContext();

  useEffect(() => {
    if (!audioRef.current || broadcastAudioStream === null || broadcastAudioStream === undefined || broadcastAudioStream.getAudioTracks().length === 0) return;

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

export const BroadcastVideoSurface = ({ id }) => {
  const videoRef = useRef();
  const { remoteTracks } = useRealtimeContext();

  const [trackInfo, setTrackInfo] = useState(null);

  useEffect(() => {
    console.log('id', id);
    console.log('remoteTracks', remoteTracks);
  }, [remoteTracks]);

  useEffect(() => {
    const trackInfo = remoteTracks.find(trackInfo => trackInfo.label === id + "-video");
    setTrackInfo(trackInfo);
  }, [id, remoteTracks]);

  useEffect(() => {
    if (!trackInfo) return;
    trackInfo.resume();
    return () => {
      trackInfo.pause();
    }
  }, [trackInfo]);

  useEffect(() => {

    if (!videoRef.current || !trackInfo || !trackInfo.track) return;

    videoRef.current.srcObject = new MediaStream([trackInfo.track]);
    videoRef.current.onloadedmetadata = (e) => {
      videoRef.current.play().catch((e) => {
        console.error("Video play Error: " + e);
      });
    };
 
  }, [id, trackInfo]);

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
