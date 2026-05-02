"use client";

import { useStageContext } from "@/components/StageContext";
import { EditableText } from "@/components/Editor/EditableText";
import Typography from "@/components/Typography";
import {
  FeatureEditorHeader,
  FeatureEditorNameField,
} from "@/components/Editor/FeatureEditorPanel";
import { Video } from "lucide-react";

export const StreamEditor = ({ broadcastStreamData }) => {
  const { updateFeature } = useStageContext();

  if (!broadcastStreamData) {
    return (
      <div className="px-4 py-4 sm:px-6">
        <Typography variant="body2">Could not load this stream.</Typography>
      </div>
    );
  }

  return (
    <FeatureEditorHeader
      title="Stream"
      withBottomBorder={false}
      titleIcon={
        <Video
          className="size-6 shrink-0"
          aria-hidden
          strokeWidth={1.75}
        />
      }
    >
      <FeatureEditorNameField>
        <EditableText
          text={broadcastStreamData.name || broadcastStreamData.id}
          variant="body1"
          onSave={(newName) => {
            updateFeature(broadcastStreamData.id, { name: newName });
          }}
        />
      </FeatureEditorNameField>
    </FeatureEditorHeader>
  );
};
