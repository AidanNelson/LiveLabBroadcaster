"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useAuthContext } from "@/components/AuthContextProvider";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import {
  useTexture,
  TransformControls,
  Text,
  useVideoTexture,
  Html,
} from "@react-three/drei";
import { ThreeCanvasDropzone } from "@/components/ThreeCanvas/Dropzone";
import { useCanvasInfo } from "@/components/Lobby/useLobbyFeatures";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector/index";
import Typography from "@/components/Typography";
import styles from "./Lobby.module.scss";
import { useUserMediaContext } from "@/components/UserMediaContext";
import { useRealtimeContext } from "@/components/RealtimeContext";
import { LobbyOverlay } from "./LobbyOverlay";
import { LobbyEditControls } from "./LobbyEditControls";

import { useLobbyContext } from "@/components/Lobby/LobbyContextProvider";
import { useStageContext } from "../StageContext";
import { add } from "lodash";

import debug from "debug";
const logger = debug("broadcaster:lobbyInner");

const GROUND_HEIGHT = 0;
export const IMAGE_HEIGHT = 1;
const AVATAR_HEIGHT = 2;

const DEFAULT_ROTATION_X = -Math.PI / 2;

const AVATAR_COLORS = {
  magenta: "#FF2D55",
  yellow: "#FC0",
  cyan: "#32ADE6",
  red: "#FF2E23",
  blue: "#007AFF",
};
function VideoMaterial({ src }) {
  const texture = useVideoTexture(src);
  // const [videoAspect, setVideoAspect] = useState(1);

  useEffect(() => {
    if (!src) return;

    const video = document.createElement("video");
    video.srcObject = src;
    video.onloadedmetadata = () => {
      const aspect = video.videoWidth / video.videoHeight;
      // setVideoAspect(aspect);

      // Reset texture transform
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);

      if (aspect > 1) {
        // Wider than tall — crop sides
        const crop = 1 / aspect;
        texture.repeat.set(crop, 1);
        texture.offset.set((1 - crop) / 2, 0);
      } else {
        // Taller than wide — crop top/bottom
        const crop = aspect;
        texture.repeat.set(1, crop);
        texture.offset.set(0, (1 - crop) / 2);
      }

      texture.needsUpdate = true;
    };
  }, [src, texture]);

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

const MovementControls = ({ positionRef, transformControlsRef, peers }) => {
  const { camera, raycaster, size } = useThree();
  const [currentZoom, setCurrentZoom] = useState(1);
  const mouseRef = useRef({ x: 0, y: 0 });
  const desiredPositionRef = useRef(new Vector3());
  const cameraPositionRef = useRef(new Vector3());
  const cameraDiffRef = useRef(new Vector3());
  const positionDiffRef = useRef(new Vector3());

  const groundRef = useRef();
  const pointerDownRef = useRef(false);

  useEffect(() => {
    const onPointerDown = (e) => {
      // Only set pointer down if clicking on the canvas element
      if (e.target.tagName.toLowerCase() === "canvas") {
        pointerDownRef.current = true;
      }
    };

    const onPointerMove = (e) => {
      // const mouse = { x: 0, y: 0 };
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onPointerUp = (e) => {
      pointerDownRef.current = false;
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [raycaster, camera]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.target.tagName.toLowerCase() === "canvas") {
        setCurrentZoom((prev) => {
          return Math.max(Math.min(prev + e.deltaY * 0.01, 10), 0.5);
        });
      }
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const setCameraAspect = () => {
      const width = size.width;
      const height = size.height;

      const aspect = width / height;

      camera.left = -10 * currentZoom * aspect;
      camera.right = 10 * currentZoom * aspect;
      camera.top = 10 * currentZoom;
      camera.bottom = -10 * currentZoom;

      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", setCameraAspect);
    setCameraAspect();

    return () => {
      window.removeEventListener("resize", setCameraAspect);
    };
  }, [currentZoom]);

  const raycastToGround = useCallback(
    (e) => {
      raycaster.layers.enable(10);
      raycaster.setFromCamera(mouseRef.current, camera);
      const intersects = raycaster.intersectObject(groundRef.current);

      if (intersects[0]) {
        desiredPositionRef.current.set(
          intersects[0].point.x,
          intersects[0].point.y,
          intersects[0].point.z,
        );
      }
    },
    [camera, raycaster],
  );

  useFrame(() => {
    cameraDiffRef.current.set(
      positionRef.current.x - cameraPositionRef.current.x,
      positionRef.current.y - cameraPositionRef.current.y,
      positionRef.current.z - cameraPositionRef.current.z,
    );

    // camera will operate on a delay
    cameraDiffRef.current.multiplyScalar(0.125);

    // move camera towards avatar
    cameraPositionRef.current.add(cameraDiffRef.current);

    camera.position.set(
      cameraPositionRef.current.x,
      cameraPositionRef.current.y + 10,
      cameraPositionRef.current.z,
    );

    if (pointerDownRef.current) {
      // don't move if transform controls are being used
      if (transformControlsRef.current && transformControlsRef.current.dragging)
        return;

      raycastToGround();

      positionDiffRef.current.set(
        desiredPositionRef.current.x - positionRef.current.x,
        desiredPositionRef.current.y - positionRef.current.y,
        desiredPositionRef.current.z - positionRef.current.z,
      );

      // move avatar towards desired position:
      positionRef.current = {
        x: positionRef.current.x + positionDiffRef.current.x * 0.025,
        y: positionRef.current.y + positionDiffRef.current.y * 0.025,
        z: positionRef.current.z + positionDiffRef.current.z * 0.025,
      };
    }

    // if we're currently colliding with other peers, move away
    const peersArray = Object.values(peers);
    const peerPositions = peersArray.map((peer) => peer.position);

    // avoid any peers within a given distance
    const avoidDistance = 2.5;

    const avoidVector = new Vector3();
    peerPositions.forEach((peerPos) => {
      const distance = Math.sqrt(
        Math.pow(peerPos.x - positionRef.current.x, 2) +
          Math.pow(peerPos.z - positionRef.current.z, 2),
      );
      if (distance < avoidDistance) {
        avoidVector.add(
          new Vector3(
            peerPos.x - positionRef.current.x,
            0,
            peerPos.z - positionRef.current.z,
          ),
        );
      }
    });
    avoidVector.multiplyScalar(0.01);
    positionRef.current.x -= avoidVector.x;
    positionRef.current.z -= avoidVector.z;
  });
  return (
    <>
      <mesh
        ref={groundRef}
        rotation={[DEFAULT_ROTATION_X, 0, 0]}
        position={[0, GROUND_HEIGHT, 0]}
        layers={[10]}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </>
  );
};

function SelfAvatar({ positionRef, displayName, displayColor }) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef();
  const { localStream } = useUserMediaContext();

  useFrame((delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.set(
      positionRef.current.x,
      AVATAR_HEIGHT - 0.1,
      positionRef.current.z,
    );
  });

  return (
    <group
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, AVATAR_HEIGHT, 0]}
      ref={meshRef}
    >
      <mesh>
        <ringGeometry args={[1, 1.25, 50]} />
        <meshBasicMaterial color={displayColor} />
      </mesh>
      {localStream && (
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[1.1, 32, 0, Math.PI * 2]} />
          <Suspense fallback={<meshBasicMaterial color={displayColor} />}>
            <VideoMaterial src={localStream} />
          </Suspense>
        </mesh>
      )}

      <Text
        color={displayColor}
        anchorX="center"
        anchorY="middle"
        position={[0, -2.0, 0]}
      >
        {displayName}
      </Text>
    </group>
  );
}

function PeerAvatar({ peer, index, videoStream, audioStream }) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef();

  const audioRef = useRef();

  const frameCount = useRef(0);

  const addStreamToAudioNode = (node, stream) => {
    if (!node || !stream) return;
    node.srcObject = stream;
    node.onloadedmetadata = () => {
      try {
        node.play();
      } catch (err) {
        console.error("Error playing peer audio:", err);
      }
    };
  };

  // we use this approach because sometimes the audiostream is available before the audio node is created
  const setAudioRef = useCallback(
    (node) => {
      addStreamToAudioNode(node, audioStream);
      audioRef.current = node;
    },
    [audioStream],
  );

  useEffect(() => {
    if (!audioRef.current || !audioStream) return;
    addStreamToAudioNode(audioRef.current, audioStream);

    return () => {
      if (!audioRef.current) return;
      audioRef.current.srcObject = null;
      audioRef.current.pause();
    };
  }, [audioStream]);

  useFrame((delta) => {}, [audioStream]);

  useFrame(({ camera }, delta) => {
    frameCount.current++;

    if (frameCount.current % 20 === 0) {
      // basic positional audio
      const distance = camera.position.distanceTo(meshRef.current.position);
      const volume = Math.max(1 - distance / 10, 0);
      audioRef.current.volume = volume;
      // audioRef.current.volume = 1; // for testing
    }

    const { position } = peer;
    const diff = {
      x: position.x - meshRef.current.position.x,
      y: position.y - meshRef.current.position.y,
      z: position.z - meshRef.current.position.z,
    };

    meshRef.current.position.x += diff.x * 0.1;
    meshRef.current.position.y = AVATAR_HEIGHT + index * -0.01;
    meshRef.current.position.z += diff.z * 0.1;
  });

  return (
    <group
      rotation={[DEFAULT_ROTATION_X, 0, 0]}
      position={[0, AVATAR_HEIGHT, 0]}
      ref={meshRef}
    >
      <Html
        style={{
          display: "none",
        }}
      >
        <audio controls ref={setAudioRef} />;
      </Html>
      <mesh>
        <ringGeometry args={[1, 1.25, 50]} />
        <meshBasicMaterial color={peer.displayColor} />
      </mesh>
      {videoStream && (
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[1.1, 32, 0, Math.PI * 2]} />
          <Suspense fallback={<meshBasicMaterial color={peer.displayColor} />}>
            <VideoMaterial src={videoStream} />
          </Suspense>
        </mesh>
      )}
      <Text
        color={peer.displayColor}
        anchorX="center"
        anchorY="middle"
        position={[0, -2.0, 0]}
      >
        {peer.displayName}
      </Text>
    </group>
  );
}

const ImagePlane = ({ url, name, ...props }) => {
  const texture = useTexture(url);
  const [aspect] = useState(() => texture.image.width / texture.image.height);
  const imagePlaneRef = useRef();
  return (
    <group name={name} ref={imagePlaneRef} {...props}>
      {/* offset the plane down so it doesn't z-fight with the transform controls */}
      <mesh>
        <planeGeometry args={[10, 10 / aspect]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

export const LobbyInner = () => {
  const { lobbyFeatures } = useLobbyContext();
  const { editorStatus } = useEditorContext();
  const { stageInfo } = useStageContext();

  const [isVisible, setIsVisible] = useState(true);

  const transformControlsRef = useRef();

  const { user, displayName, displayColor } = useAuthContext();
  const position = useRef({
    x: Math.random() - 0.5 * 20,
    y: 0,
    z: Math.random() - 0.5 * 20,
  });
  const [localPeers, setLocalPeers] = useState({});

  const { peer, socket, peerVideoStreams, peerAudioStreams } =
    useRealtimeContext();
  const { localStream } = useUserMediaContext();

  useEffect(() => {
    if (!localStream || !peer) return;
    // add tracks from local stream to peer
    peer.addTrack(localStream.getVideoTracks()[0], "peer-video");
    peer.addTrack(localStream.getAudioTracks()[0], "peer-audio");

    return () => {
      peer.removeTrack("peer-video");
      peer.removeTrack("peer-audio");
    };
  }, [localStream]);

  useEffect(() => {
    if (!peer || !user || !socket || !stageInfo) return;
    socket.on("peerInfo", (info) => {
      setLocalPeers(info);
    });

    socket.emit("joinLobby", {
      lobbyId: stageInfo.id + "-lobby",
      userId: user.id,
      displayName,
      displayColor,
    });

    const mouseSendInterval = setInterval(() => {
      socket.emit("mousePosition", position.current);
    }, 100);

    return () => {
      socket.emit("leaveLobby", { lobbyId: stageInfo.id + "-lobby" });
      socket.off("peerInfo");
      clearInterval(mouseSendInterval);
    };
  }, [socket]);

  const [selection, setSelection] = useState(null);
  const meshRef = useRef();
  return (
    <>
      {editorStatus.isEditor && <ThreeCanvasDropzone positionRef={position} />}
      <LobbyOverlay />
      <Canvas
        gl={{
          antialias: true,
          transparent: true,
        }}
        orthographic
        camera={{
          left: -10,
          right: 10,
          top: 10,
          bottom: -10,
          near: 1,
          far: 20,
          position: [0, 10, 0],
        }}
      >
        <mesh
          rotation={[DEFAULT_ROTATION_X, 0, 0]}
          position={[0, GROUND_HEIGHT - 1, 0]}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color="#232323" />
        </mesh>
        <mesh
          rotation={[DEFAULT_ROTATION_X, 0, Math.PI / 4]}
          position={[0, GROUND_HEIGHT + 1, 0]}
        >
          <ringGeometry args={[142, 100000, 4]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <gridHelper args={[200, 100]} />
        {lobbyFeatures.map((feature, index) => {
          switch (feature.type) {
            case "image":
              return (
                <ImagePlane
                  key={feature.id}
                  url={feature.info.url}
                  name={feature.id}
                  position={[
                    feature.transform.position.x,
                    IMAGE_HEIGHT + index * 0.1,
                    feature.transform.position.z,
                  ]}
                  rotation={[
                    DEFAULT_ROTATION_X,
                    0,
                    feature.transform.rotation.z,
                  ]}
                  onClick={() => {
                    setSelection(feature);
                  }}
                  onPointerMissed={(e) =>
                    e.type === "click" && setSelection(null)
                  }
                  scale={[
                    feature.transform.scale.x,
                    feature.transform.scale.y,
                    feature.transform.scale.z,
                  ]}
                />
              );
            default:
              return null;
          }
        })}
        {editorStatus.isEditor && (
          <LobbyEditControls
            transformControlsRef={transformControlsRef}
            selection={selection}
            setSelection={setSelection}
          />
        )}
        <MovementControls
          positionRef={position}
          peers={localPeers}
          transformControlsRef={transformControlsRef}
        />
        {isVisible && (
          <SelfAvatar
            positionRef={position}
            displayName={displayName}
            displayColor={displayColor}
          />
        )}

        {Object.keys(localPeers).map((peerId, index) => {
          if (peerId === socket.id) return null;
          return (
            <PeerAvatar
              peer={localPeers[peerId]}
              index={index + 1}
              videoStream={peerVideoStreams[peerId]}
              audioStream={peerAudioStreams[peerId]}
            />
          );
        })}
      </Canvas>
    </>
  );
};
