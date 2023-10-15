import { useEffect, useState, useRef, useContext } from "react";
import { PeerContext } from "./PeerContext";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// const videoInfo = {
//   type: 'webrtc',
//   id: '12345',
//   topLeft: {
//     x: 0,
//     y:0
//   },
//   topRight: {
//     x:100,
//     y:0
//   },
//   bottomLeft: {
//     x: 0,
//     y:100
//   },
//   bottomRight: {
//     x:100,
//     y:100
//   }
// }

const VideoInner = ({ feature, pos }) => {
  const { availableStreams } = useContext(PeerContext);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "unique-id",
  });

  console.log({ pos });

  // const [baseTransform, setBaseTransform] = useState({x:0,y:0, scaleX: 1, scaleY: 1})
  // const [lastKnownTransform, setLastKnownTransform] = useState({x:0,y:0, scaleX: 1, scaleY: 1});
  // const style = {
  //   transform: transform? CSS.Translate.toString({
  //     x: baseTransform.x + transform.x,
  //     y: baseTransform.y + transform.y,
  //     scaleX: baseTransform.scaleX + transform.scaleX,
  //     scaleY: baseTransform.scaleY + transform.scaleY
  //   }): CSS.Translate.toString({
  //     baseTransform
  //   }),
  // };
  // console.log({transform})

  // useEffect(() => {
  //   if (!transform){
  //     console.log('dragend, updating basetransform');
  //     setBaseTransform((previousBaseTransform) => ({
  //       x: previousBaseTransform.x + lastKnownTransform.x,
  //       y: previousBaseTransform.y + lastKnownTransform.y,
  //       scaleX: previousBaseTransform.scaleX + lastKnownTransform.scaleX,
  //       scaleY: previousBaseTransform.scaleY + lastKnownTransform.scaleY
  //     }))
  //   } else {
  //     setLastKnownTransform(transform);
  //   }
  // },[transform, lastKnownTransform]);

  // useEffect(() => {
  //   console.log({ availableStreams });
  //   if (availableStreams[0]) {
  //     console.log('adding stream to video');
  //     videoRef.current.srcObject = availableStreams[0];
  //     videoRef.current.onloadedmetadata = (e) => {
  //       console.log('metadata loaded');
  //       videoRef.current.play().catch((e) => {
  //         console.log("Play Error: " + e);
  //       });
  //     };
  //   }
  // }, [availableStreams]);

  const videoRef = useRef();

  return (
    <video
      style={{
        top: pos.y + (transform ? transform.y : 0) + "px",
        left: pos.x + (transform ? transform.x : 0) + "px",
        position: "absolute",
      }}
      {...listeners}
      {...attributes}
      playsInline
      autoPlay
      muted
      ref={videoRef}
      transform={transform}
    >
      <source src="/assets/vvv/beach.mp4"></source>
    </video>
  );
};

export const VideoFeature = ({ feature }) => {
  const [basePosition, setBasePosition] = useState({
    x: 0,
    y: 0,
  });

  const handleDragEnd = (e) => {
    console.log("drag end,", e);
    setBasePosition((pos) => ({
      x: pos.x + e.delta.x,
      y: pos.y + e.delta.y,
    }));
  };

  // useEffect(() => {
  //   console.log(position);
  // },[position]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <VideoInner feature pos={basePosition} />
    </DndContext>
  );
};

// import React, { Component } from 'react';

// export const VideoFeature = () => {
//   const [transformState, setTransformState] = useState({
//     topLeft: {
//       x: 0,
//       y: 0,
//     },
//     topRight: {
//       x: 0.4,
//       y: 0,
//     },
//     bottomLeft: {
//       x: 0,
//       y: 1,
//     },
//     bottomRight: {
//       x: 1,
//       y: 1,
//     },
//   });
//   const videoRef = useRef();

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setTransformState({ ...transformState, [name]: value });
//   };

//   const applyTransform = () => {
//     const { topLeft, topRight, bottomLeft, bottomRight } = transformState;
//     const transformValue = `matrix3d(${topLeft.x}, ${topRight.x}, 0,0,${topLeft.y}, ${topRight.y}, 0,0, ${bottomLeft.x}, ${bottomRight.x}, 1, 0,${bottomLeft.y}, ${bottomRight.y}, 0, 1)`;
//     // const transformValue = 'matrix3d(0.5,        0,      -0.866025, 0,  0.595877,   1.2,    -1.03209,  0,  0.866025,   0,       0.5,      0, 25.9808,     0,      15,        1)';
//     console.log("applying transform:", transformValue);
//     videoRef.current.style.transform = transformValue;
//     // videoRef.current.style.webkitTransform = transformValue;
//     // videoRef.current.style.msTransform = transformValue;

//     console.log(videoRef.current.style);
//   };

//   useEffect(() => {
//     applyTransform();
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} src="/assets/vvv/beach.mp4" controls></video>

//         <button onClick={applyTransform}>Apply Transform</button>

//     </div>
//   );
// };
