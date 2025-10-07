"use client";

import { useEffect, useState } from "react";
import { MainStage, MainStageControls } from "@/components/Stage";
import { Button } from "@/components/Button";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { useUserInteractionContext } from "@/components/UserInteractionContext";
import { useAuthContext } from "@/components/AuthContextProvider";
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

  return (
    <>
      <RealtimeContextProvider isLobby={false}>
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
          {(!hasInteracted || !hasCompletedOnboarding) && (
              <AudienceOnboarding
                hasCompletedOnboarding={hasCompletedOnboarding}
                setHasCompletedOnboarding={setHasCompletedOnboarding}
                onboardingFor="stage"
              />
            )}
          {hasInteracted && hasCompletedOnboarding && (
            <AudienceView />
          )}
        </div>
      </RealtimeContextProvider>
    </>
  );
}
