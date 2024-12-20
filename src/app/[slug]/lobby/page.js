"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
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
import { useCanvasInfo } from "@/hooks/useCanvasInfo";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector/index";
import Typography from "@/components/Typography";
import styles from "./Lobby.module.scss";
import { useUserMediaContext } from "@/components/UserMediaContext";
// import { MediaDeviceSelector } from "@/hooks/useUserMedia";
import { useRealtimeContext } from "@/components/RealtimeContext";

const GROUND_HEIGHT = 0;
const IMAGE_HEIGHT = 1;
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

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

const MovementControls = ({ positionRef, transformControlsRef }) => {
  const { camera, raycaster } = useThree();
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
      pointerDownRef.current = true;
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
      setCurrentZoom((prev) => {
        return Math.max(Math.min(prev + e.deltaY * 0.01, 100), 0.1);
      });
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const setCameraAspect = () => {
      console.log("updating camera params");
      const width = window.innerWidth;
      const height = window.innerHeight;
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
  });
  return (
    <>
      <mesh
        ref={groundRef}
        rotation={[DEFAULT_ROTATION_X, 0, 0]}
        position={[0, GROUND_HEIGHT, 0]}
        layers={[10]}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh
        rotation={[DEFAULT_ROTATION_X, 0, Math.PI / 4]}
        position={[0, GROUND_HEIGHT, 0]}
      >
        <ringGeometry args={[700, 10000, 4]} />
        <meshBasicMaterial color="0x232323" />
      </mesh>
    </>
  );
};

const EditControls = ({ updateFeature, transformControlsRef, selection }) => {
  const { scene } = useThree();

  const [transformMode, setTransformMode] = useState("translate");
  const [snapOn, setSnapOn] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "w") {
        setTransformMode("translate");
      }
      if (e.key === "e") {
        setTransformMode("rotate");
      }
      if (e.key === "r") {
        setTransformMode("scale");
      }
      if (e.key === "Shift") {
        setSnapOn(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "Shift") {
        setSnapOn(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <>
      {selection !== null && (
        <TransformControls
          ref={transformControlsRef}
          size={2}
          object={scene.getObjectByName(selection.id)}
          mode={transformMode}
          showX={transformMode === "translate" || transformMode === "scale"}
          showY={transformMode === "rotate" || transformMode === "scale"}
          showZ={transformMode === "translate"}
          translationSnap={snapOn ? 1 : null}
          rotationSnap={snapOn ? Math.PI / 4 : null}
          scaleSnap={snapOn ? 0.2 : null}
          onObjectChange={(e) => {
            console.log(e);

            // console.log(selection);
            const objectInScene = scene.getObjectByName(selection.id);
            const euler = new Euler().setFromQuaternion(
              objectInScene.quaternion,
            );

            if (snapOn) {
              // apply uniform scaling
              const uniformScale = Math.max(
                objectInScene.scale.x,
                objectInScene.scale.y,
              );
              objectInScene.scale.set(uniformScale, uniformScale, uniformScale);
            }

            const updatedFeature = {
              ...selection,
              transform: {
                position: {
                  x: objectInScene.position.x,
                  y: IMAGE_HEIGHT,
                  z: objectInScene.position.z,
                },
                rotation: {
                  x: 0,
                  y: 0,
                  z: euler.z,
                },
                scale: {
                  x: objectInScene.scale.x,
                  y: objectInScene.scale.y,
                  z: objectInScene.scale.z,
                },
              },
            };
            updateFeature(selection.id, updatedFeature);
          }}
        />
      )}
    </>
  );
};

function SelfAvatar({ positionRef, displayName, displayColor }) {
  // console.log('heloo from peer',props);
  // This reference will give us direct access to the mesh
  const meshRef = useRef();
  const { localStream } = useUserMediaContext();

  useEffect(() => {
    console.log("localStream in avatar", localStream);
  }, [localStream]);

  useFrame((delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.set(
      positionRef.current.x,
      AVATAR_HEIGHT,
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
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.1, 32, 0, Math.PI * 2]} />
        <Suspense fallback={<meshBasicMaterial color={displayColor} />}>
          <VideoMaterial src={localStream} />
        </Suspense>
      </mesh>
      <Text
        color={displayColor}
        anchorX="center"
        anchorY="middle"
        position={[0, -2.5, 0]}
      >
        {displayName}
      </Text>
    </group>
  );
}

function PeerAvatar({ peer, index, videoStream, audioStream }) {
  // console.log('heloo from peer',props);
  // This reference will give us direct access to the mesh
  const meshRef = useRef();

  const audioRef = useRef();

  const frameCount = useRef(0);

  useEffect(() => {
    if (!audioRef.current || !audioStream) return;
    audioRef.current.srcObject = audioStream;
    try {
      audioRef.current.play();
    } catch (err) {
      console.error("Error playing peer audio:", err);
    }
  }, [audioStream]);

  useFrame((delta) => {}, [audioStream]);

  useFrame(({ camera }, delta) => {
    frameCount.current++;

    if (frameCount.current % 20 === 0) {
     // basic positional audio
      const distance = camera.position.distanceTo(meshRef.current.position);
      const volume = Math.max(1 - distance / 10, 0);
      audioRef.current.volume = volume;
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
        <audio autoPlay ref={audioRef} />;
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
        position={[0, -2.5, 0]}
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
const LobbyInner = () => {
  const [canvasId] = useState("75a0c744-3f21-458a-a7b3-f2c9b2427b04"); // this shoudl come from somewhere...
  const { canvasFeatures, addFeature, updateFeature } = useCanvasInfo({
    canvasId,
  });
  const { editorStatus } = useEditorContext();

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
    console.log("peerVideoStreams", peerVideoStreams);
  }, [peerVideoStreams]);

  useEffect(() => {
    if (localStream && peer) {
      // add tracks from local stream to peer
      peer.addTrack(localStream.getVideoTracks()[0], "peer-video");
      peer.addTrack(localStream.getAudioTracks()[0], "peer-audio");
    }
  }, [localStream]);

  useEffect(() => {
    socket.on("peerInfo", (info) => {
      // console.log(info);
      setLocalPeers(info);
    });

    socket.emit("joinLobby", {
      lobbyId: "lobby",
      userId: user.id,
      displayName,
      displayColor,
    });

    const mouseSendInterval = setInterval(() => {
      socket.emit("mousePosition", position.current);
    }, 100);

    return () => {
      socket.off("peerInfo");
      clearInterval(mouseSendInterval);
    };
  }, [socket]);

  const [selection, setSelection] = useState(null);
  const meshRef = useRef();
  return (
    <>
      <ThreeCanvasDropzone
        addFeature={addFeature}
        canvasId={canvasId}
        positionRef={position}
      />
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
        <gridHelper args={[1000, 100]} />
        {canvasFeatures.map((feature, index) => {
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
          <EditControls
            transformControlsRef={transformControlsRef}
            updateFeature={updateFeature}
            selection={selection}
          />
        )}
        <MovementControls
          positionRef={position}
          transformControlsRef={transformControlsRef}
        />

        <SelfAvatar
          positionRef={position}
          displayName={displayName}
          displayColor={displayColor}
        />

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
export default function Lobby() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  return (
    <>
      <RealtimeContextProvider roomId={"lobby"}>
        <div className={styles.lobbyContainer}>
          {!hasCompletedOnboarding && (
            <LobbyOnboarding
              hasCompletedOnboarding={hasCompletedOnboarding}
              setHasCompletedOnboarding={setHasCompletedOnboarding}
            />
          )}
          {hasCompletedOnboarding && <LobbyInner />}
        </div>
      </RealtimeContextProvider>
    </>
  );
}
const LobbyOnboarding = ({
  setHasCompletedOnboarding,
  hasCompletedOnboarding,
}) => {
  const { user, displayName, setDisplayName, displayColor, setDisplayColor } =
    useAuthContext();

  const videoPreviewRef = useRef();
  const [videoWidth, setVideoWidth] = useState(200);
  const {
    localStream,
    hasRequestedMediaDevices,
    setHasRequestedMediaDevices,
    skippedMediaDeviceSetup,
    setSkippedMediaDeviceSetup,
    devicesInfo,
    switchDevice,
  } = useUserMediaContext();

  const { peer, socket } = useRealtimeContext();

  useEffect(() => {
    console.log("localstream:", localStream);
    if (!localStream) return;
    videoPreviewRef.current.srcObject = localStream;
    videoPreviewRef.current.onLoadedMetadata = () => {
      console.log("play video");
      videoPreviewRef.current.play();
    };
  }, [localStream]);

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.header}>
        <Typography variant="hero">
          Before we get started, <br />
          let's check a few things
        </Typography>
        <Typography variant="subtitle">
          Please reply to the following questions before entering the lobby
        </Typography>
      </div>
      <div className={styles.questionsAndAvatarPreview}>
        <div className={styles.questions}>
          <div className={styles.nameInputAndLabel}>
            <label for="displayName">
              <Typography variant="heading">What is your name?</Typography>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              placeholder="Your Name"
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className={styles.colorPickerAndLabel}>
            <Typography variant="heading">
              <label for="colorPicker">Choose a color (optional)</label>
            </Typography>
            <Typography variant="body2">
              This is how people will see you in the lobby
            </Typography>
            <div className={styles.buttonContainer}>
              <button
                onClick={(e) => {
                  setDisplayColor(AVATAR_COLORS.magenta);
                }}
                style={{ backgroundColor: AVATAR_COLORS.magenta }}
              ></button>
              <button
                onClick={(e) => {
                  setDisplayColor(AVATAR_COLORS.yellow);
                }}
                style={{ backgroundColor: AVATAR_COLORS.yellow }}
              ></button>
              <button
                onClick={(e) => {
                  setDisplayColor(AVATAR_COLORS.cyan);
                }}
                style={{ backgroundColor: AVATAR_COLORS.cyan }}
              ></button>
              <button
                onClick={(e) => {
                  setDisplayColor(AVATAR_COLORS.red);
                }}
                style={{ backgroundColor: AVATAR_COLORS.red }}
              ></button>
              <button
                onClick={(e) => {
                  setDisplayColor(AVATAR_COLORS.blue);
                }}
                style={{ backgroundColor: AVATAR_COLORS.blue }}
              ></button>
            </div>
          </div>
          <div className={styles.entranceButtons}>
            {!hasRequestedMediaDevices && !skippedMediaDeviceSetup && (
              <>
                <button
                  className={"buttonSmall"}
                  onClick={() => {
                    setHasRequestedMediaDevices(true);
                  }}
                >
                  <Typography variant="buttonSmall">
                    Join with Webcam
                  </Typography>
                </button>
                <button
                  className={"buttonText"}
                  onClick={() => {
                    setSkippedMediaDeviceSetup(true);
                  }}
                >
                  <Typography variant="buttonSmall">
                    Join without Webcam
                  </Typography>
                </button>
              </>
            )}

            {(hasRequestedMediaDevices || skippedMediaDeviceSetup) && (
              <button
                className={"buttonLarge"}
                onClick={() => setHasCompletedOnboarding(true)}
                style={{
                  alignSelf: "center",
                }}
              >
                <Typography variant="buttonLarge">Enter Lobby</Typography>
              </button>
            )}
          </div>
        </div>

        <div className={styles.avatarPreviewContainer}>
          <div className={styles.avatarPreviewAndLabel}>
            <div className={styles.svgAndVideo}>
              <svg height="200" width="200">
                <clipPath id="circleClip">
                  <circle cx={videoWidth / 2} cy="100" r="90" />
                </clipPath>
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  stroke={displayColor}
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
              <video
                onResize={(e) => {
                  setVideoWidth(e.target.clientWidth);
                }}
                style={{ clipPath: "url(#circleClip)" }}
                ref={videoPreviewRef}
                autoPlay
                muted
              />
            </div>
            <Typography variant="subtitle">
              {displayName || "Your Name"}
            </Typography>
          </div>
          {hasRequestedMediaDevices && (
            <>
              <MediaDeviceSelector />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
