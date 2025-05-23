import { useStageContext } from "@/components/StageContext";
import { supabase } from "@/components/SupabaseClient";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { FaLink } from "react-icons/fa6";
import { IoMdDownload } from "react-icons/io";
import styles from "./AssetManagementPanel.module.scss";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import { CiImageOn } from "react-icons/ci";

import debug from "debug";
const logger = debug("broadcaster:assetManagementPanel");

export const FileUploadDropzone = ({ setFileListIsStale }) => {
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
    logger("File dropped:", file);
    const handleUpload = async () => {
      const { data, error } = await uploadFileToStageAssets({
        stageInfo,
        file,
      });

      if (error) {
        console.error("Error uploading file:", error);
      } else {
        logger("File uploaded successfully:", data);
        setFileListIsStale(true);
      }
    };
    handleUpload();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true, // Disable click activation
    onDrop,
    multiple: false,
    // accept: "image/jpeg, image/png", "*"
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
        {isDragActive && (
          <h1 style={{ color: "white" }}>
            <Typography variant={"subheading"}>
              Drop File to Upload...
            </Typography>
          </h1>
        )}
      </div>
    </>
  );
};

function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

const convertFileNameToBase64 = (name) => {
  return bytesToBase64(new TextEncoder().encode(name));
};
const convertBase64ToFileName = (encoded) => {
  return new TextDecoder().decode(base64ToBytes(encoded));
};

const uploadFileToStageAssets = async ({ stageInfo, file }) => {
  logger("attempting to upload file:", file, "to stage", stageInfo);
  const { data, error } = await supabase.storage
    .from("assets")
    .upload(`${stageInfo.id}/${convertFileNameToBase64(file.name)}`, file, {
      upsert: true,
    });

  if (error) {
    console.error;
  }
  return { data, error };
};

const FileList = ({
  fileListIsStale,
  setFileListIsStale,
  showSetHomepageImage,
  showSetProgramFile,
}) => {
  const { stageInfo } = useStageContext();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileListIsStale || !stageInfo) return;
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage
        .from("assets")
        .list(stageInfo.id);

      const withoutPlaceholder = data.filter((file) => {
        return file.name !== ".emptyFolderPlaceholder";
      });

      const withDecodedFilenames = withoutPlaceholder.map((file) => {
        return { ...file, decodedFileName: convertBase64ToFileName(file.name) };
      });
      logger("data:", withDecodedFilenames);

      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setFiles(withDecodedFilenames);
      }

      setLoading(false);
    };

    fetchFiles();
    setFileListIsStale(false);
  }, [stageInfo, fileListIsStale]);

  const copyLink = async (file) => {
    const { data } = supabase.storage
      .from("assets")
      .getPublicUrl(`${stageInfo.id}/${file.name}`);
    const { publicUrl } = data;
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        logger("Public URL copied to clipboard:", publicUrl);
      } catch (err) {
        console.error("Failed to copy public URL to clipboard:", err);
      }
    }
  };

  const setProgramFile = async (file) => {
    const { data, error } = await supabase
      .from("stages")
      .update({ additional_production_info: {type: "downloadable", filename: file.name} })
      .eq("id", stageInfo.id)
      .select();

    if (error) {
      console.error("Error setting program file:", error);
    } else {
      logger("Program file set successfully:", data);
    }
  };

  const setHomepageImage = async (file) => {
    const { data, error } = await supabase
      .from("stages")
      .update({ poster_image_filename: file.name })
      .eq("id", stageInfo.id)
      .select();

    if (error) {
      console.error("Error setting homepage image:", error);
    } else {
      logger("Homepage image set successfully:", data);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.fileListContainer}>
      <FileUploadDropzone setFileListIsStale={setFileListIsStale} />
      {files.length === 0 && (
        <div className={styles.placeholderText}>
          <Typography variant="subtitle">Drag file here to upload</Typography>
        </div>
      )}
      {files.map((file) => (
        <div
          className={styles.fileListItem}
          key={file.name}
          style={{ display: "flex", alignItems: "center" }}
        >
          <div className={styles.filePreview}>
            <img></img>
          </div>
          <div className={styles.fileName}>
            <Typography variant="body1">{file.decodedFileName}</Typography>
          </div>
          <div className={styles.actionItems}>
            {showSetProgramFile && (
              <Button variant="icon" onClick={() => setProgramFile(file)}>
                <IoMdDownload />
              </Button>
            )}
            {showSetHomepageImage && (
              <Button variant="icon" onClick={() => setHomepageImage(file)}>
                <CiImageOn />
              </Button>
            )}
            <Button variant="icon" onClick={() => copyLink(file)}>
              <FaLink />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FileUpload = ({ setFileListIsStale }) => {
  const { stageInfo } = useStageContext();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    const { data, error } = uploadFileToStageAssets({ stageInfo, file });

    setUploading(false);

    if (error) {
      console.error("Error uploading file:", error);
    } else {
      logger("File uploaded successfully:", data);
      setFileListIsStale(true);
      setFile(null);
      fileInputRef.current.value = null;
    }
  };

  return (
    <div>
      <h4>Upload File</h4>
      <input ref={fileInputRef} type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export const AssetMangementPanel = ({ showSetHomepageImage }) => {
  const [fileListIsStale, setFileListIsStale] = useState(true);

  return (
    <FileList
      fileListIsStale={fileListIsStale}
      setFileListIsStale={setFileListIsStale}
      showSetHomepageImage={showSetHomepageImage}
      showSetProgramFile={showSetHomepageImage}
    />
  );
};
