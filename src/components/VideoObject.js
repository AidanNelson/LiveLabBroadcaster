import { useEffect, useState, useRef } from "react";



export const VideoFeature = ({featureInfo, peer}) => {
    const videoRef = useRef();
    const sourceRef = useRef();
  
    useEffect(() => {
      videoRef.current.play();
    }, []);
  
    return (
      <video ref={videoRef}>
        <source ref={sourceRef} src="/assets/vvv/beach.mp4"></source></video>
    )
  }