import { useEffect, useState, useRef, useContext } from "react";
import { PeerContext } from "./PeerContext";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { updateFeature } from "@/components/db";
import { StageContext } from "./StageContext";

const VideoInner = ({ info }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "unique-id",
  });
  const videoRef = useRef();
  const [featureInfo, setFeatureInfo] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);
  const { stageId } = useContext(StageContext);
  const { availableStreams } = useContext(PeerContext);

  useEffect(() => {
    setFeatureInfo(info);
  }, [info]);

  // useUpdateFeature({ info: featureInfo });

  const lastKnownTransform = useRef({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  const [baseTransform, setBaseTransform] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });
  const currentTransformRef = useRef({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  useEffect(() => {
    if (hasChanged) {

      updateFeature({ stageId, info: featureInfo });
      setHasChanged(false);
    }
  }, [hasChanged, featureInfo]);
  useEffect(() => {
    const stageWidth = videoRef.current.parentElement.clientWidth;
    const stageHeight = videoRef.current.parentElement.clientHeight;
    const positionInPercentage = {
      x: baseTransform.x / stageWidth,
      y: baseTransform.y / stageHeight,
    };

    setFeatureInfo((prev) => ({
      ...prev,
      ...positionInPercentage,
    }));
  }, [baseTransform]);

  useEffect(() => {
    const stageWidth = videoRef.current.parentElement.clientWidth;
    const stageHeight = videoRef.current.parentElement.clientHeight;
    console.log("setting current transform from server value:", info);
    if (info.x) {
      setBaseTransform({
        x: info.x * stageWidth,
        y: info.y * stageHeight,
        scaleX: 1,
        scaleY: 1,
      });
      currentTransformRef.current = {
        x: info.x * stageWidth,
        y: info.y * stageHeight,
        scaleX: 1,
        scaleY: 1,
      };
    }
  }, [info]);

  useEffect(() => {
    if (!transform) {
      setBaseTransform((previous) => ({
        x: previous.x + lastKnownTransform.current.x,
        y: previous.y + lastKnownTransform.current.y,
        scaleX: previous.scaleX + lastKnownTransform.current.scaleX,
        scaleY: previous.scaleY + lastKnownTransform.current.scaleY,
      }));
      setHasChanged(true);


    } else {
      lastKnownTransform.current = transform;
      currentTransformRef.current = {
        x: baseTransform.x + transform.x,
        y: baseTransform.y + transform.y,
        scaleX: baseTransform.scaleX + transform.scaleX,
        scaleY: baseTransform.scaleY + transform.scaleY,
      };

    }
  }, [transform]);

  // useEffect(() => {
  //   console.log({ availableStreams });
  //   if (availableStreams[0]) {
  //     console.log("adding stream to video");
  //     videoRef.current.srcObject = availableStreams[0];
  //     videoRef.current.onloadedmetadata = (e) => {
  //       console.log("metadata loaded");
  //       videoRef.current.play().catch((e) => {
  //         console.log("Play Error: " + e);
  //       });
  //     };
  //   }
  // }, [availableStreams]);

  return (
    <video
      style={{
        // top: baseTransform.y + (transform ? transform.y : 0) + "px",
        // left: baseTransform.x + (transform ? transform.x : 0) + "px",
        top: currentTransformRef.current.y + "px",
        left: currentTransformRef.current.x + "px",
        transform: "translate(-50%,-50%)",
        position: "relative",
        opacity: 0.5,
      }}
      {...listeners}
      {...attributes}
      playsInline
      autoPlay
      muted
      loop
      ref={videoRef}
      transform={transform}
    >
      <source src="/assets/vvv/beach.mp4"></source>
    </video>
  );
};

export const VideoFeature = ({ info }) => {
  return (
    <DndContext>
      <VideoInner info={info} />
    </DndContext>
  );
};
