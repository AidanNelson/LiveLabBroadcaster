import { useEffect, useState, useRef, useContext } from "react";
import { PeerContext } from "./PeerContext";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { updateFeature } from "@/components/db";
import { StageContext } from "./StageContext";

export const BroadcastAudioPlayer = () => {
  const audioRef = useRef();
  const { broadcastAudioStream } = useContext(PeerContext);

  useEffect(() => {
    console.log("Broadcast audio stream:",broadcastAudioStream);
    audioRef.current.srcObject = broadcastAudioStream;
    audioRef.current.onloadedmetadata = (e) => {
      audioRef.current.play().catch((e) => {
        console.log("Audio play Error: " + e);
      });
    };
  }, [broadcastAudioStream]);

  return (
    <audio
      style={{
        top: "0px",
        left: "0px",
        position: "absolute",
        display: 'none'
      }}
      playsInline
      autoPlay
      ref={audioRef}
    >
    </audio>
  );
}


export const BroadcastVideoSurface = () => {
  const videoRef = useRef();
  const { broadcastVideoStream } = useContext(PeerContext);

  useEffect(() => {
    console.log("Broadcast video stream:",broadcastVideoStream);
    videoRef.current.srcObject = broadcastVideoStream;
    videoRef.current.onloadedmetadata = (e) => {
      videoRef.current.play().catch((e) => {
        console.log("Video play Error: " + e);
      });
    };
    setTimeout(() => {
      videoRef.current.play().catch((e) => {
        console.log("Video play Error: " + e);
      });
    },1000);
  }, [broadcastVideoStream]);

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
    >
    </video>
  );
};
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
