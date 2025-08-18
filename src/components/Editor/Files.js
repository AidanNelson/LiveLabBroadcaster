import { useStageContext } from "../StageContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../SupabaseClient";
import { useEditorContext } from "./EditorContext";
import { Button } from "@/components/Button";
import Typography from "@/components/Typography";
import { FaLink } from "react-icons/fa6";

import debug from "debug";
const logger = debug("broadcaster:files");

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

export const convertFileNameToBase64 = (name) => {
  return bytesToBase64(new TextEncoder().encode(name));
};
export const convertBase64ToFileName = (encoded) => {
  return new TextDecoder().decode(base64ToBytes(encoded));
};

export const uploadFileToStageAssets = async ({ stageInfo, file }) => {
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

export const FileList = ({ fileListIsStale, setFileListIsStale }) => {
  const { stageInfo } = useStageContext();
  const { editorStatus } = useEditorContext();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileListIsStale) return;
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
  }, [stageInfo.id, fileListIsStale]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ul>
        {files.map((file) => (
          <li key={file.name} style={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1">{file.decodedFileName}</Typography>
            <Button variant="icon" onClick={() => copyLink(file)}>
              <FaLink />
            </Button>
            {/* {editorStatus.currentEditor === "canvasEditor" && (
              <button
                onClick={() =>
                  addImageToCanvas({
                    stageInfo,
                    file,
                    featureIndex: editorStatus.target,
                  })
                }
              >
                Add to Canvas
              </button>
            )} */}
          </li>
        ))}
      </ul>
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

export const FileInner = () => {
  const [fileListIsStale, setFileListIsStale] = useState(true);
  return (
    <>
      {/* <FileUpload setFileListIsStale={setFileListIsStale} /> */}
      {/* <hr /> */}
      <FileList
        fileListIsStale={fileListIsStale}
        setFileListIsStale={setFileListIsStale}
      />
    </>
  );
};

export const FileModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <Button variant="primary" size="small" onClick={openModal}>
        Upload File
      </Button>

      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <FileInner />
          </div>
        </div>
      )}
    </div>
  );
};
