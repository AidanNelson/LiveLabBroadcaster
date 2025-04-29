"use client";

import { useEffect, useState } from "react";
import { MainStage, MainStageControls } from "@/components/Stage";
import { Button } from "@/components/Button";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { useUserInteractionContext } from "@/components/UserInteractionContext";

export const AudienceView = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <MainStage />
      <MainStageControls />
    </div>
  );
};

export default function Stage() {
  const { hasInteracted } = useUserInteractionContext();

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
          {!hasInteracted && (
            <Button variant="primary">Enter Production</Button>
          )}
          {hasInteracted && <AudienceView />}
        </div>
      </RealtimeContextProvider>
    </>
  );
}
