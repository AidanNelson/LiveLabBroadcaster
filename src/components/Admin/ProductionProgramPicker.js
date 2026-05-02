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

const selectClassName =
  "flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function ProductionProgramPicker({
  downloadableFilename,
  onProgramChange,
}) {
  const { stageInfo } = useStageContext();
  const [assetFiles, setAssetFiles] = useState([]);
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
        console.error("Error fetching assets for program:", error);
        setAssetFiles([]);
      } else {
        const withoutPlaceholder = (data || []).filter(
          (file) => file.name !== ".emptyFolderPlaceholder",
        );
        const withDecoded = withoutPlaceholder.map((file) => ({
          ...file,
          decodedFileName: convertBase64ToFileName(file.name),
        }));
        setAssetFiles(withDecoded);
      }
      setLoading(false);
      setListStale(false);
    };

    fetchFiles();
  }, [stageInfo?.id, listStale]);

  const refreshList = useCallback(() => setListStale(true), []);

  const handleSelectChange = (e) => {
    const v = e.target.value;
    if (v === "") {
      onProgramChange(null);
      return;
    }
    onProgramChange({ type: "downloadable", filename: v });
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
      console.error("Program file upload failed:", error);
      return;
    }

    const storageName =
      data?.path?.split("/").pop() ?? convertFileNameToBase64(file.name);
    onProgramChange({ type: "downloadable", filename: storageName });
    refreshList();
  };

  if (!stageInfo?.id) {
    return (
      <Typography variant="body3" className="text-muted-foreground">
        Loading stage…
      </Typography>
    );
  }

  const valueInList = assetFiles.some((f) => f.name === downloadableFilename);
  const selectValue = downloadableFilename ?? "";

  return (
    <div className="space-y-3">
      <Label htmlFor="production-program-asset">Downloadable program file</Label>
      <Typography variant="body3" className="text-muted-foreground">
        Choose any file already in this production&apos;s assets, or upload a new
        one. The audience poster shows a &quot;Get Program&quot; button when this
        is set.
      </Typography>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <select
          id="production-program-asset"
          className={selectClassName}
          value={selectValue}
          onChange={handleSelectChange}
          disabled={loading}
        >
          <option value="">No program file</option>
          {!valueInList && downloadableFilename ? (
            <option value={downloadableFilename}>
              Current (not in asset list)
            </option>
          ) : null}
          {assetFiles.map((file) => (
            <option key={file.name} value={file.name}>
              {file.decodedFileName}
            </option>
          ))}
        </select>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading || loading}
        >
          {uploading ? "Uploading…" : "Upload to assets & set as program"}
        </Button>
      </div>
    </div>
  );
}
