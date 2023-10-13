import { useEffect, useState, useRef, useContext } from "react";
import { PeerContext } from "./PeerContext";

export const VideoFeature = ({ feature }) => {
  const { availableStreams } = useContext(PeerContext);

  useEffect(() => {
    console.log({ availableStreams });
    if (availableStreams[0]) {
      console.log('adding stream to video');
      videoRef.current.srcObject = availableStreams[0];
      videoRef.current.onloadedmetadata = (e) => {
        console.log('metadata loaded');
        videoRef.current.play().catch((e) => {
          console.log("Play Error: " + e);
        });
      };
    }
  }, [availableStreams]);

  const videoRef = useRef();
  const sourceRef = useRef();



  return (
    <video playsInline autoPlay muted ref={videoRef}>
    </video>
  );
};
