"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { PeerContextProvider, usePeerContext } from "@/components/PeerContext";
import { useStageContext } from "@/components/StageContext";
import { useAuthContext } from "@/components/AuthContextProvider";
import { supabase } from "@/components/SupabaseClient";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { DoubleSide, Shape, Euler } from "three";
import { Line } from "@react-three/drei";
import { EditableCanvasFeatures } from "@/components/ThreeCanvas";
import { Image, useTexture, TransformControls } from "@react-three/drei";
import { transform, update } from "lodash";
import { ThreeCanvasDropzone } from "@/components/ThreeCanvas/Dropzone";
import { useCanvasInfo } from "@/hooks/useCanvasInfo";

const GROUND_HEIGHT = 0;
const IMAGE_HEIGHT = 1;
const AVATAR_HEIGHT = 2;

const DEFAULT_ROTATION_X = -Math.PI / 2;

// let hell0 =
// {
//   "url": "https://backend.sheepdog.work/storage/v1/object/public/assets/c8048812-3941-418b-92f6-219cc8e305fd/MzMuanBlZw==",
//   "properties": {
//     "position": {
//       "x": 0,
//       "y": 0.5,
//       "z": 0,
//    },
//     "scale": {
//       "x": 1,
//       "y": 1,
//       "z": 1,
//     },
//     "rotation": {
//       "x": 0,
//       "y": 0,
//       "z": 0
//     }
//   }
// }

const LobbyControls = ({ updateFeature, positionRef, selection }) => {
  const { scene, camera, raycaster } = useThree();
  // const { updateFeature, features } = useStageContext();
  const [currentZoom, setCurrentZoom] = useState(1);
  const mouseRef = useRef({ x: 0, y: 0 });
  const desiredPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const cameraPositionRef = useRef({ x: 0, y: 0, z: 0 });

  const groundRef = useRef();
  const pointerDownRef = useRef(false);
  const transformControlsRef = useRef();
  const [transformMode, setTransformMode] = useState("translate");
  const [snapOn, setSnapOn] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      console.log(e.key);
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
        return Math.max(Math.min(prev + e.deltaY * 0.01, 10), 0.1);
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

  const raycastToGround = (e) => {
    raycaster.setFromCamera(mouseRef.current, camera);
    const intersects = raycaster.intersectObject(groundRef.current);

    if (intersects[0]) {
      desiredPositionRef.current = {
        x: intersects[0].point.x,
        y: intersects[0].point.y,
        z: intersects[0].point.z,
      };
    }
  };

  useFrame(() => {
    const cameraDiff = {
      x: positionRef.current.x - cameraPositionRef.current.x,
      y: positionRef.current.y - cameraPositionRef.current.y,
      z: positionRef.current.z - cameraPositionRef.current.z,
    };

    // move camera towards avatar
    cameraPositionRef.current = {
      x: cameraPositionRef.current.x + cameraDiff.x * 0.025,
      y: cameraPositionRef.current.y + cameraDiff.y * 0.025,
      z: cameraPositionRef.current.z + cameraDiff.z * 0.025,
    };

    camera.position.set(
      cameraPositionRef.current.x,
      cameraPositionRef.current.y + 10,
      cameraPositionRef.current.z,
    );

    if (pointerDownRef.current) {
      if (transformControlsRef.current && transformControlsRef.current.dragging)
        return;
      raycastToGround();
      const diff = {
        x: desiredPositionRef.current.x - positionRef.current.x,
        y: desiredPositionRef.current.y - positionRef.current.y,
        z: desiredPositionRef.current.z - positionRef.current.z,
      };

      // move avatar towards desired position:
      positionRef.current = {
        x: positionRef.current.x + diff.x * 0.025,
        y: positionRef.current.y + diff.y * 0.025,
        z: positionRef.current.z + diff.z * 0.025,
      };
    }
  });
  return (
    <>
      {selection !== null && (
        <TransformControls
          ref={transformControlsRef}
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

            console.log(selection);
            const objectInScene = scene.getObjectByName(selection.id);
            const currentPosition = objectInScene.position;
            // const currentRotation = objectInScene.rotation;
            // const quaternion = objectInScene.quaternion;
            const euler = new Euler().setFromQuaternion(
              objectInScene.quaternion,
            );
            // objectInScene.matrix.decompose(objectInScene.position, objectInScene.quaternion, objectInScene.scale);
            // euler.setFromQuaternion(objectInScene.quaternion);

            // const rotationY = euler.y;

            const currentScale = objectInScene.scale;

            if (snapOn) {
              // apply uniform scaling
              const uniformScale = Math.min(currentScale.x, currentScale.z);
              objectInScene.scale.set(uniformScale, uniformScale, uniformScale); // Apply uniform scaling
            }
            // console.log(
            //   "rotation about XYZ:",
            //   euler
            // );

            // push update to server

            const updatedFeature = {
              ...selection,
              transform: {
                position: {
                  x: currentPosition.x,
                  y: IMAGE_HEIGHT,
                  z: currentPosition.z,
                },
                rotation: {
                  x: 0, // we apply default rotation to the x axis so that the image is always facing up, don't save in db
                  // y: rotationY,
                  y: 0,
                  z: euler.z,
                },
                scale: {
                  x: currentScale.x,
                  y: currentScale.y,
                  z: currentScale.z,
                },
              },
            };
            // const updatedFeature = {
            //   ...feature,
            //   info: {
            //     images: {
            //       ...selection.info.images,
            //       [selection.name]: updatedImage,
            //     },
            //   },
            // };
            updateFeature(selection.id, updatedFeature);
          }}
        />
      )}

      <mesh
        ref={groundRef}
        rotation={[DEFAULT_ROTATION_X, 0, 0]}
        position={[0, GROUND_HEIGHT, 0]}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    </>
  );
};

function SelfAvatar({ positionRef }) {
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
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, AVATAR_HEIGHT, 0]}
      ref={meshRef}
    >
      <ringGeometry args={[1, 1.5, 50]} />
      <meshBasicMaterial color={"yellow"} />
    </mesh>
    // <Line
    //   points={new Shape().absarc(0, 0, 1, 0, Math.PI * 2).getPoints(50)} // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
    //   color="yellow" // Default
    //   lineWidth={5} // In pixels (default)
    //   dashed={false} // Default
    //   rotation={[-Math.PI/2, 0, 0]}
    //   position={[0, 2, 0]}
    //   ref={meshRef}
    // />
  );
}

function PeerAvatar({ peer }) {
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
    meshRef.current.position.y = AVATAR_HEIGHT;
    meshRef.current.position.z += diff.z * 0.1;
    // meshRef.current.position.set(
    //   positionRef.current.x,
    //   1,
    //   positionRef.current.z,
    // );
  });

  return (
    <mesh
      rotation={[DEFAULT_ROTATION_X, 0, 0]}
      position={[0, AVATAR_HEIGHT, 0]}
      ref={meshRef}
    >
      <ringGeometry args={[1, 1.5, 50]} />
      <meshBasicMaterial color={"red"} />
    </mesh>
    // <Line
    //   points={new Shape().absarc(0, 0, 1, 0, Math.PI * 2).getPoints(50)} // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
    //   color="black" // Default
    //   lineWidth={2} // In pixels (default)
    //   dashed={false} // Default
    //   rotation={[-1.5, 0, 0]}
    //   position={[0, 3, 0]}
    //   ref={meshRef}
    // />
  );

  // return (
  //   <mesh rotation={[0, -Math.PI / 2, 0]} ref={meshRef}>
  //     <boxGeometry args={[2, 2, 2]} />
  //     <meshBasicMaterial color={"hotpink"} />
  //   </mesh>
  // <div
  //   key={peers[peerId].id}
  //   style={{
  //     position: "absolute",
  //     left: peers[peerId].position.x,
  //     top: peers[peerId].position.y,
  //     color: peers[peerId].displayColor,
  //   }}
  // >
  //   {peers[peerId].displayName}
  // </div>
  // );
}

// function Box(props) {
//   // This reference will give us direct access to the mesh
//   const meshRef = useRef();
//   // Set up state for the hovered and active state
//   const [hovered, setHover] = useState(false);
//   const [active, setActive] = useState(false);
//   // Subscribe this component to the render-loop, rotate the mesh every frame
//   useFrame((state, delta) => {
//     meshRef.current.rotation.x += delta;
//     meshRef.current.rotation.y += delta;
//   });
//   // Return view, these are regular three.js elements expressed in JSX
//   return (
//     <mesh
//       {...props}
//       ref={meshRef}
//       scale={active ? 1.5 : 1}
//       onClick={(event) => setActive(!active)}
//       onPointerOver={(event) => setHover(true)}
//       onPointerOut={(event) => setHover(false)}
//     >
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
//     </mesh>
//   );
// }

const ImagePlane = ({ url, name, ...props }) => {
  const texture = useTexture(url);
  const [aspect] = useState(() => texture.image.width / texture.image.height);
  const imagePlaneRef = useRef();
  return (
    <mesh name={name} ref={imagePlaneRef} {...props}>
      <planeGeometry args={[10, 10 / aspect]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};
const LobbyInner = () => {
  const [canvasId] = useState("75a0c744-3f21-458a-a7b3-f2c9b2427b04"); // this shoudl come from somewhere...
  // const { features } = useStageContext();
  const { canvasFeatures, addFeature, updateFeature } = useCanvasInfo({
    canvasId,
  });
  // const lobbyInfo = features.find((feature) => feature.type === "lobbyCanvas");

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

  // useEffect(() => {
  //   const channel = supabase.channel("lobby_room");
  //   const MOUSE_EVENT = "position";

  //   // Subscribe to mouse events.
  //   // Our second parameter filters only for mouse events.
  //   channel
  //     .on("broadcast", { event: MOUSE_EVENT }, (info) => {
  //       receivedCursorPosition(info);
  //     })
  //     .subscribe();

  //   // Handle a mouse event.
  //   const receivedCursorPosition = ({ event, payload }) => {
  //     console.log(`
  //       User: ${payload.userId},
  //       displayName: ${payload.displayName},
  //       x Position: ${payload.x}
  //       y Position: ${payload.y}
  //     `);
  //   };

  //   // Helper function for sending our own mouse position.
  //   const sendMousePosition = (userId, displayName, x, y) => {
  //     return channel.send({
  //       type: "broadcast",
  //       event: MOUSE_EVENT,
  //       payload: { userId, displayName, x, y },
  //     });
  //   };

  //   const mouseSendInterval = setInterval(() => {
  //     sendMousePosition(user.id, displayName, mousePosition.x, mousePosition.y);
  //   }, 100);

  //   return () => {
  //     supabase.removeChannel(channel);
  //     clearInterval(mouseSendInterval);
  //   };
  // }, [user, displayName]);

  const [selection, setSelection] = useState(null);
  const meshRef = useRef();
  return (
    <>
      <ThreeCanvasDropzone addFeature={addFeature} canvasId={canvasId} />
      <Canvas
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
        {canvasFeatures.map((feature) => {
          switch (feature.type) {
            case "image":
              return (
                <ImagePlane
                  key={feature.id}
                  url={feature.info.url}
                  name={feature.id}
                  position={[
                    feature.transform.position.x,
                    IMAGE_HEIGHT,
                    feature.transform.position.z,
                  ]}
                  rotation={[DEFAULT_ROTATION_X, 0, feature.transform.rotation.z]}
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

        {/* <EditableCanvasFeatures /> */}
        <LobbyControls
          // feature={lobbyInfo}
          positionRef={position}
          selection={selection}
          updateFeature={updateFeature}
        />

        <SelfAvatar positionRef={position} />

        {/* {Object.keys(localPeers).map((peerId) => {
          if (peerId === socket.id) return null;
          return <PeerAvatar peer={localPeers[peerId]} />;
        })} */}
      </Canvas>
    </>
  );
};
export default function Lobby() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { user, displayName, setDisplayName, displayColor, setDisplayColor } =
    useAuthContext();

  // const { stageInfo } = useStageContext();

  const { peer, socket } = useRealtimePeer({
    autoConnect: false,
    roomId: "lobby",
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

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
            </div>
          )}
          {hasInteracted && <LobbyInner />}
        </div>
      </PeerContextProvider>
    </>
  );
}
