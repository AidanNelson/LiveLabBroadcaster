import { useEffect, useState, useRef, useContext } from "react";
import { PeerContext } from "./PeerContext";

export const VideoFeature = ({ featureInfo, peer }) => {
  const { availableStreams } = useContext(PeerContext);

  useEffect(() => {
    console.log({availableStreams});
  },[availableStreams]);

  const videoRef = useRef();
  const sourceRef = useRef();

  useEffect(() => {
    videoRef.current.play();
  }, []);

  return (
    <video ref={videoRef}>
      <source ref={sourceRef} src="/assets/vvv/beach.mp4"></source>
    </video>
  );
};
