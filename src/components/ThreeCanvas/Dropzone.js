import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useStageContext } from "../StageContext";
import { uploadFileToStageAssets } from "../Editor/Files";
import { supabase } from "../SupabaseClient";
import { useLobbyContext } from "../Lobby/LobbyContextProvider";

const createNewThreeCanvasImage = async ({ url, position }) => {
  return {
    info: { url: url },
    type: "image",
    transform: {
      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
      position: {
        x: position.x,
        y: 1,
        z: position.z,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  };
};

export const addImageToThreeCanvas = async ({ path, stageId, position }) => {
  // console.log("Adding Image to Three Canvas:", file);
  const { stageInfo } = useStageContext();
  const { addFeature } = useLobbyContext();
  const { data } = supabase.storage.from("assets").getPublicUrl(path);

  const { publicUrl } = data;
  if (publicUrl) {
    try {
      if (!stageInfo?.id) return;
      // const updatedFeature = structuredClone(feature);

      const newImage = await createNewThreeCanvasImage({
        url: publicUrl,
        position,
      });
      newImage.stage_id = stageInfo.id;
      console.log("attempting to add feature", newImage);
      // const id = Date.now().toString() + "_" + Math.random().toString();
      // updatedFeature.info.images[id] = newImage;

      addFeature(newImage);
    } catch (err) {
      console.error("Failed to add image to three canvas:", err);
    }
  }
};

export const ThreeCanvasDropzone = ({ positionRef }) => {
  const { addFeature } = useLobbyContext();
  const { stageInfo } = useStageContext();
  if (!stageInfo) return;
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDragLeave);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDragLeave);
    };
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles[0]) return;

    const file = acceptedFiles[0];
    console.log("File dropped:", file);
    const handleUpload = async () => {
      const { data, error } = await uploadFileToStageAssets({
        stageInfo,
        file,
      });

      if (error) {
        console.error("Error uploading file:", error);
      } else {
        console.log("File uploaded successfully:", data);

        addImageToThreeCanvas({
          path: data.path,
          file: data,
          position: positionRef.current,
        });
      }
    };
    handleUpload();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true, // Disable click activation
    onDrop,
    multiple: false,
    accept: "image/jpeg, image/png",
  });
  return (
    <>
      <div
        {...getRootProps({
          style: {
            width: "90%",
            height: "90%",
            position: "absolute",
            left: "5%",
            top: "5%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            display: isDragging ? "flex" : "none",
            background: isDragActive
              ? "rgba(20, 20, 20, 0.5)"
              : "rgba(0,0,0,0)",
            border: isDragActive ? "1px dashed white" : "none",
            zIndex: 10,
          },
        })}
      >
        <input {...getInputProps()} />
        {isDragActive && <h1 style={{ color: "white" }}>Drop Image...</h1>}
      </div>
    </>
  );
};
