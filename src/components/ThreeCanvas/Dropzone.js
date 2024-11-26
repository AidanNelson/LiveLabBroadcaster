import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useStageContext } from "../StageContext";
import { uploadFileToStageAssets } from "../Editor/Files";
import { supabase } from "../SupabaseClient";


const getAspectRatio = async ({ url }) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        resolve(img.width / img.height);
      };
    });
  };
  
  const createNewThreeCanvasImage = async ({ url }) => {
    const aspectRatio = await getAspectRatio({ url });
    const imageWidth = 3;
    const imageHeight = imageWidth / aspectRatio;
    console.log("aspect:", aspectRatio);
    return {
      url: url,
      scale: {
        x: imageWidth,
        y: 1,
        z: imageHeight,
      },
      position: {
        x: 0,
        y: 1,
        z: 0,
      },
      rotation: {
        x: -1.5707963267948966,
        y: 0,
        z: 0,
      },
    };
  
    // {
    //     "id": Date.now() + "_" + Math.random().toString(),
    //     "url": url,
    //     "properties": {
    //         "x": SCENE_WIDTH / 2 - (imageWidth / 2) + (Math.random() - 0.5) * 200,
    //         "y": SCENE_HEIGHT / 2 - (imageHeight / 2) + (Math.random() - 0.5) * 200,
    //         "width": imageWidth,
    //         "height": imageHeight,
    //         "scaleX": 1,
    //         "scaleY": 1,
    //         "rotation": 0,
    //     }
    // }
  };
  
  export const addImageToThreeCanvas = async ({ feature, file, updateFeature }) => {
    console.log("Adding Image to Three Canvas:", file);
  
    const { data } = supabase.storage
      .from("assets")
      .getPublicUrl(file.path ? file.path : `${feature.stage_id}/${file.name}`);
  
    // const imageSize = await getImageSizeFromFile(file);
    // const aspectRatio = imageSize.width / imageSize.height;
    const { publicUrl } = data;
    if (publicUrl) {
      try {
        const updatedFeature = structuredClone(feature);
  
        const newImage = await createNewThreeCanvasImage({ url: publicUrl });
        const id = Date.now().toString() + "_" + Math.random().toString();
        updatedFeature.info.images[id] = newImage;
  
        updateFeature(feature.id, updatedFeature);
  
        // update canvas feature with new image
        // const updatedFeature = structuredClone(stageInfo.features[featureIndex]);
        // updatedFeature.images.push(await createNewCanvasImage({ url: publicUrl }));
        // console.log('updated feature:', updatedFeature);
        // updateFeature(updatedFeature.id, updatedFeature);
      } catch (err) {
        console.error("Failed to add image to three canvas:", err);
      }
    }
  };

export const ThreeCanvasDropzone = ({ feature }) => {
  const { stageInfo, updateFeature } = useStageContext();
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

        addImageToThreeCanvas({ feature, file: data, updateFeature });
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
            width: 1800,
            height: 900,
            position: "absolute",
            left: 50,
            top: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            display: isDragging ? "flex" : "none",
            background: isDragActive
              ? "rgba(20, 20, 20, 0.7)"
              : "rgba(0,0,0,0)",
            border: isDragActive ? "4px dashed white" : "none",
            zIndex: 10,
          },
        })}
      >
        <input {...getInputProps()} />
        {isDragActive && <h1 className="">Drop Image...</h1>}
      </div>
    </>
  );
};
