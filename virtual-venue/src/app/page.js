"use client"

import {useEffect, useState, useRef} from 'react';
import {peer} from "./mediaConnection.js";

export default function Home() {
  const  [initialized, setInitialized] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    peer.on("track", (track) => {
      // deal with incoming track
      console.log('track:', track);
      if (track.track.kind === "video"){
        videoRef.current.srcObject = new MediaStream([track.track]);
      }
    });
  
  },[]);
  return (
    <>
    <div
      style={{ position: 'absolute',
        marginLeft: '50vw',
        top: '50vh',
        padding: '0px',
        transform: 'translateX(-50%) translateY(-50%)',
        zIndex: '10',
      }}
    >
      <button onClick={() => {
        setInitialized(true);
      }} style={{width: '100px', height: '50px', zIndex: 10, display: initialized? 'none':'block'}}>
        Enter
      </button>
      <video ref={videoRef} autoPlay playsInline/>

    </div>    
    </>
  )
}