import { useStageContext } from "@/components/StageContext";
import { supabase } from "@/components/SupabaseClient";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { FaLink } from "react-icons/fa6";
import styles from "./AssetManagementPanel.module.scss";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { File, FileAudio, FileImage, FileVideo, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button as UiButton } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

/** Extension-based; used for preview only (storage names stay base64). */
function getAssetCategory(decodedFileName) {
  const ext = decodedFileName.includes(".")
    ? decodedFileName.split(".").pop()?.toLowerCase() ?? ""
    : "";
  if (/^(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/.test(ext)) return "image";
  if (/^(mp3|wav|ogg|m4a|flac|aac|wma)$/.test(ext)) return "audio";
  if (/^(mp4|webm|mov|mkv|avi)$/.test(ext)) return "video";
  return "other";
}

function AssetThumbnail({ file, stageInfo, onOpenImagePreview }) {
  const [imgError, setImgError] = useState(false);
  const category = getAssetCategory(file.decodedFileName);
  const { data } = supabase.storage
    .from("assets")
    .getPublicUrl(`${stageInfo.id}/${file.name}`);
  const publicUrl = data?.publicUrl;

  const showImagePreview =
    category === "image" && Boolean(publicUrl) && !imgError;

  const canOpenLarge =
    category === "image" && Boolean(publicUrl) && typeof onOpenImagePreview === "function";

  let Icon = File;
  if (category === "audio") Icon = FileAudio;
  else if (category === "video") Icon = FileVideo;
  else if (category === "image") Icon = FileImage;

  const previewClass = `${styles.filePreview} ${
    showImagePreview ? styles.filePreviewHasImage : styles.filePreviewIconWrap
  }`;

  const inner = showImagePreview ? (
    <img
      src={publicUrl}
      alt=""
      className={styles.thumbnailImage}
      onError={() => setImgError(true)}
    />
  ) : (
    <Icon
      className={styles.filePreviewIcon}
      size={28}
      strokeWidth={1.5}
      aria-hidden
    />
  );

  if (canOpenLarge) {
    return (
      <button
        type="button"
        className={`${previewClass} ${styles.thumbnailButton}`}
        onClick={() => onOpenImagePreview(publicUrl, file.decodedFileName)}
        aria-label={`Open larger preview: ${file.decodedFileName}`}
      >
        {inner}
      </button>
    );
  }

  return <div className={previewClass}>{inner}</div>;
}

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

const FileList = ({ fileListIsStale, setFileListIsStale }) => {
  const { stageInfo } = useStageContext();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!imagePreview) return;
    const onKey = (e) => {
      if (e.key === "Escape") setImagePreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imagePreview]);

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

  const deleteAsset = async (file) => {
    const path = `${stageInfo.id}/${file.name}`;
    const { error } = await supabase.storage.from("assets").remove([path]);
    if (error) {
      console.error("Error deleting asset:", error);
      return;
    }
    logger("Deleted asset:", path);
    setImagePreview(null);
    setFileListIsStale(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TooltipProvider delayDuration={200}>
    <div className={styles.fileListContainer}>
      <FileUploadDropzone setFileListIsStale={setFileListIsStale} />
      {imagePreview && (
        <div
          className={styles.imageModalBackdrop}
          onClick={() => setImagePreview(null)}
          role="presentation"
        >
          <div
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <button
              type="button"
              className={styles.imageModalClose}
              onClick={() => setImagePreview(null)}
              aria-label="Close"
            >
              <X size={22} strokeWidth={2} />
            </button>
            <img
              src={imagePreview.url}
              alt=""
              className={styles.imageModalImg}
            />
            <Typography variant="body3" className={styles.imageModalCaption}>
              {imagePreview.title}
            </Typography>
          </div>
        </div>
      )}
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
          <AssetThumbnail
            file={file}
            stageInfo={stageInfo}
            onOpenImagePreview={(url, title) => setImagePreview({ url, title })}
          />
          <div className={styles.fileName}>
            <Typography variant="body1">{file.decodedFileName}</Typography>
          </div>
          <div className={styles.actionItems}>
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <UiButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${file.decodedFileName}`}
                    >
                      <Trash2 />
                    </UiButton>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete asset</TooltipContent>
              </Tooltip>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <span className="font-bold">{file.decodedFileName}</span>{" "}
                    will be permanently removed from storage. This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteAsset(file)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button variant="icon" onClick={() => copyLink(file)}>
                    <FaLink />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Copy public asset URL</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
    </TooltipProvider>
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

export const AssetMangementPanel = () => {
  const [fileListIsStale, setFileListIsStale] = useState(true);

  return (
    <FileList
      fileListIsStale={fileListIsStale}
      setFileListIsStale={setFileListIsStale}
    />
  );
};
