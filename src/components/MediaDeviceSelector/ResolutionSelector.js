import React, { useState } from "react";
import { VIDEO_RESOLUTION_PRESETS } from "@/hooks/useUserMedia";

export const ResolutionSelector = ({ currentVideoResolution, onChange }) => {
  const [preset, setPreset] = useState("fullhd");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const handlePresetChange = (e) => {
    const value = e.target.value;
    setPreset(value);

    if (value === "custom") {
      onChange(null); // let parent know there's no preset
    } else {
      onChange(value);
    }
  };

  const handleCustomChange = () => {
    const width = parseInt(customWidth, 10);
    const height = parseInt(customHeight, 10);
    if (width > 0 && height > 0) {
      onChange({ width: { ideal: width }, height: { ideal: height } });
    }
  };

  return (
    <div>
      <label>
        Resolution:
        <select value={preset} onChange={handlePresetChange}>
          {Object.keys(VIDEO_RESOLUTION_PRESETS).map((key) => (
            <option key={key} value={key}>
              {key.toUpperCase()}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>

      {preset === "custom" && (
        <div>
          <input
            type="number"
            placeholder="Width"
            value={customWidth}
            onChange={(e) => setCustomWidth(e.target.value)}
            onBlur={handleCustomChange}
          />
          <input
            type="number"
            placeholder="Height"
            value={customHeight}
            onChange={(e) => setCustomHeight(e.target.value)}
            onBlur={handleCustomChange}
          />
        </div>
      )}
    </div>
  );
};