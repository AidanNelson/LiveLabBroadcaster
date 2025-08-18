"use client";

import { useState } from "react";

import { LobbyContextProvider } from "@/components/Lobby/LobbyContextProvider";
import { AudienceOnboarding } from "@/components/AudienceOnboarding";
import { LobbyInner } from "@/components/Lobby";
import { ThreePanelLayout } from "@/components/ThreePanelLayout";
import Typography from "@/components/Typography";
import { FlexPanel } from "@/components/Editor/FlexPanel";

const LobbyAdminLeftPanel = () => {
  return (
    <Typography variant={"subtitle"}>Admin Panel</Typography>
  )
}
const LobbyPreview = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  return (
    <>
      {!hasCompletedOnboarding && (
        <AudienceOnboarding
          hasCompletedOnboarding={hasCompletedOnboarding}
          setHasCompletedOnboarding={setHasCompletedOnboarding}
        />
      )}
      {hasCompletedOnboarding && <LobbyInner />}
    </>
  );
};
export const LobbyAdmin = () => {
  return (
    <>
      <LobbyContextProvider>
        <ThreePanelLayout
          left={<LobbyAdminLeftPanel />}
          rightTop={<LobbyPreview />}
          rightBottom={<FlexPanel />}
        ></ThreePanelLayout>
      </LobbyContextProvider>
    </>
  );
};
