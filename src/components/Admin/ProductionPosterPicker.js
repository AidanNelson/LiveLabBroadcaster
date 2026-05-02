"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStageContext } from "@/components/StageContext";
import { supabase } from "@/components/SupabaseClient";
import {
  convertBase64ToFileName,
  convertFileNameToBase64,
  uploadFileToStageAssets,
} from "@/components/Editor/Files";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Typography from "@/components/Typography";

function isImageAsset(decodedFileName) {
  const ext = decodedFileName.includes(".")
    ? decodedFileName.split(".").pop()?.toLowerCase() ?? ""
    : "";
  return /^(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/.test(ext);
}

export function ProductionPosterPicker({
  posterImageFilename,
  onPosterChange,
}) {
  const { stageInfo } = useStageContext();
  const [imageFiles, setImageFiles] = useState([]);
  const [listStale, setListStale] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!listStale || !stageInfo?.id) return;

    const fetchFiles = async () => {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from("assets")
        .list(stageInfo.id);

      if (error) {
        console.error("Error fetching assets for poster:", error);
        setImageFiles([]);
      } else {
        const withoutPlaceholder = (data || []).filter(
          (file) => file.name !== ".emptyFolderPlaceholder",
        );
        const withDecoded = withoutPlaceholder.map((file) => ({
          ...file,
          decodedFileName: convertBase64ToFileName(file.name),
        }));
        setImageFiles(withDecoded.filter((f) => isImageAsset(f.decodedFileName)));
      }
      setLoading(false);
      setListStale(false);
    };

    fetchFiles();
  }, [stageInfo?.id, listStale]);

  const refreshList = useCallback(() => setListStale(true), []);

  const handleSelectChange = (e) => {
    const v = e.target.value;
    onPosterChange(v === "" ? null : v);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !stageInfo) return;

    setUploading(true);
    const { data, error } = await uploadFileToStageAssets({ stageInfo, file });
    setUploading(false);

    if (error) {
      console.error("Poster upload failed:", error);
      return;
    }

    const storageName =
      data?.path?.split("/").pop() ?? convertFileNameToBase64(file.name);
    onPosterChange(storageName);
    refreshList();
  };

  if (!stageInfo?.id) {
    return (
      <Typography variant="body3" className="text-muted-foreground">
        Loading stage…
      </Typography>
    );
  }

  const valueInList = imageFiles.some((f) => f.name === posterImageFilename);
  const selectValue = posterImageFilename ?? "";

  return (
    <div className="space-y-3">
      <Label htmlFor="production-poster-asset">Poster image</Label>
      <Typography variant="body3" className="text-muted-foreground">
        Choose an existing image from assets, or upload a new one (it is saved
        to this production&apos;s assets and set as the poster).
      </Typography>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <select
          id="production-poster-asset"
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectValue}
          onChange={handleSelectChange}
          disabled={loading}
        >
          <option value="">No poster image</option>
          {!valueInList && posterImageFilename ? (
            <option value={posterImageFilename}>
              Current (not in image list)
            </option>
          ) : null}
          {imageFiles.map((file) => (
            <option key={file.name} value={file.name}>
              {file.decodedFileName}
            </option>
          ))}
        </select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading || loading}
        >
          {uploading ? "Uploading…" : "Upload to assets & set poster"}
        </Button>
      </div>
    </div>
  );
}
