import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useStageContext } from "../StageContext";
import { uploadFileToStageAssets } from "./Files";

export const FileUploadDropzone = ({  }) => {
  const { stageInfo } = useStageContext();
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
            width:"90%",
            height:"90%",
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
        {isDragActive && <h1 style={{color: "white"}}>Drop Image...</h1>}
      </div>
    </>
  );
};
