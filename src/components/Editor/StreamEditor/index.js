"use client";

import { useStageContext } from "@/components/StageContext";
import { EditableText } from "@/components/Editor/EditableText";
import Typography from "@/components/Typography";

export const StreamEditor = ({ broadcastStreamData }) => {
  const { updateFeature } = useStageContext();

  if (!broadcastStreamData) {
    return (
      <Typography variant="body2">Could not load this stream.</Typography>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-16)",
        padding: "var(--spacing-16)",
      }}
    >
      <Typography variant="subheading">Stream</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-8)",
        }}
      >
        <Typography variant="body2">Name</Typography>
        <EditableText
          text={broadcastStreamData.name || broadcastStreamData.id}
          variant="body1"
          onSave={(newName) => {
            updateFeature(broadcastStreamData.id, { name: newName });
          }}
        />
      </div>
    </div>
  );
};
