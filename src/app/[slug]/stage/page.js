"use client";

import { useState } from "react";
import { MainStage, MainStageControls } from "@/components/Stage";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { useUserInteractionContext } from "@/components/UserInteractionContext";
import { AudienceOnboarding } from "@/components/AudienceOnboarding";

export const AudienceView = () => {
  const [showAmbientCopresenceOverlay, setShowAmbientCopresenceOverlay] =
    useState(true);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <MainStage showAmbientCopresenceOverlay={showAmbientCopresenceOverlay} />
      <MainStageControls
        showAmbientCopresenceOverlay={showAmbientCopresenceOverlay}
        setShowAmbientCopresenceOverlay={setShowAmbientCopresenceOverlay}
      />
    </div>
  );
};

export default function Stage() {
  const { hasInteracted } = useUserInteractionContext();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const ready = hasInteracted && hasCompletedOnboarding;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!ready && (
        <AudienceOnboarding
          setHasCompletedOnboarding={setHasCompletedOnboarding}
        />
      )}
      {ready && (
        <RealtimeContextProvider>
          <AudienceView />
        </RealtimeContextProvider>
      )}
    </div>
  );
}
