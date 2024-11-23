"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { PeerContextProvider, usePeerContext } from "@/components/PeerContext";
import { useStageContext } from "@/components/StageContext";
import { useAuthContext } from "@/components/AuthContextProvider";
import { supabase } from "@/components/SupabaseClient";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { DoubleSide, Shape } from "three";
// import { LineMaterial } from "three-stdlib";
// extend({ LineMaterial });
import { Line } from "@react-three/drei";

const LobbyControls = ({ positionRef }) => {
  const { camera, raycaster } = useThree();
  const [currentZoom, setCurrentZoom] = useState(1);
  const [desiredPosition, setDesiredPosition] = useState({ x: 0, y: 0, z: 0 });

  const groundRef = useRef();
  const pointerDownRef = useRef(false);

  useEffect(() => {
    const onPointerDown = (e) => {
      pointerDownRef.current = true;
    };
    const onPointerUp = (e) => {
      pointerDownRef.current = false;
    };
    const raycastToGround = (e) => {
      if (!pointerDownRef.current) return;
      const mouse = { x: 0, y: 0 };
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(groundRef.current);

      if (intersects[0]) {
        setDesiredPosition({
          x: intersects[0].point.x,
          y: intersects[0].point.y,
          z: intersects[0].point.z,
        });
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", raycastToGround);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", raycastToGround);
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

  useFrame(() => {
    if (!pointerDownRef.current || desiredPosition === positionRef.current)
      return;
    const diff = {
      x: desiredPosition.x - positionRef.current.x,
      y: desiredPosition.y - positionRef.current.y,
      z: desiredPosition.z - positionRef.current.z,
    };

    // move camera towards desired position:
    positionRef.current = {
      x: positionRef.current.x + diff.x * 0.01,
      y: positionRef.current.y + diff.y * 0.01,
      z: positionRef.current.z + diff.z * 0.01,
    };

    // console.log(camera);
    camera.position.set(
      positionRef.current.x,
      positionRef.current.y + 10,
      positionRef.current.z,
    );
    camera.lookAt(
      positionRef.current.x,
      positionRef.current.y,
      positionRef.current.z,
    );
  });
  return (
    <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial color="blue" />
    </mesh>
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
      1,
      positionRef.current.z,
    );
  });

  return (
    <Line
      points={new Shape().absarc(0, 0, 1, 0, Math.PI * 2).getPoints(50)} // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
      color="yellow" // Default
      lineWidth={2} // In pixels (default)
      dashed={false} // Default
      rotation={[-1.5, 0, 0]}
      position={[0, 1, 0]}
      ref={meshRef}
    />
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
    meshRef.current.position.y = 1;
    meshRef.current.position.z += diff.z * 0.1;
    // meshRef.current.position.set(
    //   positionRef.current.x,
    //   1,
    //   positionRef.current.z,
    // );
  });

  return (
    <Line
      points={new Shape().absarc(0, 0, 1, 0, Math.PI * 2).getPoints(50)} // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
      color="black" // Default
      lineWidth={2} // In pixels (default)
      dashed={false} // Default
      rotation={[-1.5, 0, 0]}
      position={[0, 1, 0]}
      ref={meshRef}
    />
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

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
const LobbyInner = () => {
  const { user, displayName, displayColor } = useAuthContext();
  // const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0, z: 0 });
  const position = useRef({ x: 0, y: 0, z: 0 });
  const mousePosition = useRef({ x: 0, y: 0 });
  const [localPeers, setLocalPeers] = useState({});
  const { socket } = usePeerContext();

  const getCurrentPosition = () => {
    return position.current;
  };

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
      socket.emit("mousePosition", getCurrentPosition());
    }, 100);

    return () => {
      socket.off("peerInfo");
      clearInterval(mouseSendInterval);
    };
  }, [socket]);

  useEffect(() => {
    const onMouseMove = (e) => {
      mousePosition.current.x = e.clientX;
      mousePosition.current.y = e.clientY;
    };
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

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

  return (
    <>
      <Canvas
        orthographic
        camera={{
          left: -10,
          right: 10,
          top: 10,
          bottom: -10,
          position: [0, 10, 0],
        }}
      >
        <mesh position={[0, 1, 0]} rotation={[0, 1, 1]}>
          <circleGeometry args={[1, 32, 0, Math.PI * 2]} />
          <meshBasicMaterial color={"yellow"} side={DoubleSide} />
        </mesh>
        <LobbyControls positionRef={position} />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Box position={[-1.5, 0, 0]} />
        {/* <Box
          position={[position.current.x, position.current.y, currentPosition.z]}
        /> */}
        <SelfAvatar positionRef={position} />

        {Object.keys(localPeers).map((peerId) => {
          if (peerId === socket.id) return null;
          return <PeerAvatar peer={localPeers[peerId]} />;
        })}
      </Canvas>
    </>
  );
};
export default function Lobby() {
  const [hasInteracted, setHasInteracted] = useState(false);

  const { user, displayName, setDisplayName, displayColor, setDisplayColor } =
    useAuthContext();

  const { stageInfo } = useStageContext();

  const { peer, socket } = useRealtimePeer({
    autoConnect: false,
    roomId: stageInfo?.id + "_lobby",
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
