"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { PeerContextProvider, usePeerContext } from "@/components/PeerContext";
import { useAuthContext } from "@/components/AuthContextProvider";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import { useTexture, TransformControls, Text } from "@react-three/drei";
import { ThreeCanvasDropzone } from "@/components/ThreeCanvas/Dropzone";
import { useCanvasInfo } from "@/hooks/useCanvasInfo";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";

const GROUND_HEIGHT = 0;
const IMAGE_HEIGHT = 1;
const AVATAR_HEIGHT = 2;

const DEFAULT_ROTATION_X = -Math.PI / 2;

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

function PeerAvatar({ peer, index }) {
  // console.log('heloo from peer',props);
  // This reference will give us direct access to the mesh
  const meshRef = useRef();

  useFrame((delta) => {
    if (!meshRef.current) return;

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
      <mesh>
        <ringGeometry args={[1, 1.25, 50]} />
        <meshBasicMaterial color={peer.displayColor} />
      </mesh>
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
  const { socket } = usePeerContext();

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
          return <PeerAvatar peer={localPeers[peerId]} index={index + 1} />;
        })}
      </Canvas>
    </>
  );
};
export default function Lobby() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { user, displayName, setDisplayName, displayColor, setDisplayColor } =
    useAuthContext();

  // const { stageInfo } = useStageContext();

  const [localStream, setLocalStream] = useState(null);
  const [peerVideoStreams, setPeerVideoStreams] = useState({});

  const { peer, socket } = useRealtimePeer({
    autoConnect: true,
    roomId: "lobby",
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  useEffect(() => {
    if (localStream) {
      // add tracks from local stream to peer
      peer.addTrack(localStream.getVideoTracks()[0], socket.id + "-video");
      peer.addTrack(localStream.getAudioTracks()[0], socket.id + "-audio");
    }
  }, [localStream]);

  useEffect(() => {
    console.log("peerVideoStreams", peerVideoStreams);
  }, [peerVideoStreams]);

  useEffect(() => {
    if (!peer) return;
    peer.on("track", ({ track, peerId, label }) => {
      // do something with this new track
      console.log(
        "New",
        track.kind,
        "track available from peer with id",
        peerId,
        "with label",
        label,
      );
      if (track.kind === "video") {
        const stream = new MediaStream([track]);

        setPeerVideoStreams((prev) => {
          return { ...prev, [peerId]: stream };
        });

        // check for inactive streams every 500ms
        const checkInterval = setInterval(() => {
          if (!stream.active) {
            console.log("stream no longer active: ", stream);
            setPeerVideoStreams((prev) => {
              delete prev[peerId];
              return { ...prev };
            });
          }
        }, 500);

        return () => {
          clearInterval(checkInterval);
        };
      }
    });
  }, [peer]);

  return (
    <>
      <PeerContextProvider peer={peer} socket={socket}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: "100vw",
            height: "100vh",
          }}
        >
          {!hasInteracted && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignSelf: "center",
                textAlign: "center",
                color: "white",
              }}
            >
              <div style={{ textAlign: "start" }}>
                <h1>
                  Before we get started, <br />
                  let's check a few things
                </h1>
              </div>
              <MediaDeviceSelector
                localStream={localStream}
                setLocalStream={setLocalStream}
              />
              <div>
                <label for="displayName">Display Name:</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <label for="colorPicker">Choose a color:</label>
                <input
                  id="colorPicker"
                  type="color"
                  value={displayColor}
                  onChange={(e) => setDisplayColor(e.target.value)}
                />
              </div>
              <div>
                <button onClick={() => setHasInteracted(true)}>
                  <h3>Enter Lobby Space</h3>
                </button>
              </div>
              {Object.keys(peerVideoStreams).map((peerId) => {
                return <VideoSource stream={peerVideoStreams[peerId]} />;
              })}
            </div>
          )}
          {hasInteracted && <LobbyInner />}
        </div>
      </PeerContextProvider>
    </>
  );
}

const VideoSource = ({ stream }) => {
  const videoRef = useRef();
  useEffect(() => {
    videoRef.current.srcObject = stream;
    videoRef.current.onLoadedMetadata = () => {
      console.log("play video");
      videoRef.current.play();
    };
  }, [stream]);
  return <video ref={videoRef} autoPlay muted />;
};
