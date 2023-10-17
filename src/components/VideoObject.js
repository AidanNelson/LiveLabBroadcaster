import { useEffect, useState, useRef, useContext } from "react";
import { PeerContext } from "./PeerContext";
import { DndContext, useDraggable } from "@dnd-kit/core";


const VideoInner = ({ feature }) => {
  const { availableStreams } = useContext(PeerContext);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "unique-id",
  });
  const videoRef = useRef();
  const lastKnownTransform = useRef({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  const [baseTransform, setBaseTransform] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  useEffect(() => {
    if (!transform) {
      console.log("dragend");
      console.log("null transform:", transform);
      console.log("last known transform:", lastKnownTransform.current);
      setBaseTransform((previous) => ({
        x: previous.x + lastKnownTransform.current.x,
        y: previous.y + lastKnownTransform.current.y,
        scaleX: previous.scaleX + lastKnownTransform.current.scaleX,
        scaleY: previous.scaleY + lastKnownTransform.current.scaleY,
      }));
      // TODO: update the server here:
      // const stageWidth = videoRef.current.parentElement.clientWidth;
      //   const stageHeight = videoRef.current.parentElement.clientHeight;
      //   const positionInPercentage = {
      //     x: pos.y + (transform ? transform.y : 0)
      //   }
    } else {
      console.log("good transform:", transform);
      lastKnownTransform.current = transform;
    }
  }, [transform]);

  useEffect(() => {
    console.log({ availableStreams });
    if (availableStreams[0]) {
      console.log("adding stream to video");
      videoRef.current.srcObject = availableStreams[0];
      videoRef.current.onloadedmetadata = (e) => {
        console.log("metadata loaded");
        videoRef.current.play().catch((e) => {
          console.log("Play Error: " + e);
        });
      };
    }
  }, [availableStreams]);

  return (
    <video
      style={{
        top: baseTransform.y + (transform ? transform.y : 0) + "px",
        left: baseTransform.x + (transform ? transform.x : 0) + "px",
        position: "relative",
        opacity: 0.5,
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

  return (
    <DndContext>
      <VideoInner feature />
    </DndContext>
  );
};