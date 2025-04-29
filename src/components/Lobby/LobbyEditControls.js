import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Euler } from "three";
import { TransformControls } from "@react-three/drei";

import { useLobbyContext } from "@/components/Lobby/LobbyContextProvider";
import { IMAGE_HEIGHT } from ".";

export const LobbyEditControls = ({
  transformControlsRef,
  selection,
  setSelection,
}) => {
  const { updateFeature, deleteFeature } = useLobbyContext();
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
      if (e.key === "x") {
        if (!selection) return;
        const selectionId = selection.id;
        confirm("Are you sure you want to delete this feature?") &&
          deleteFeature(selectionId);
        setSelection(null);
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
  }, [selection, setSelection, deleteFeature]);

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
