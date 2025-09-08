"use client";

import { useState } from "react";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { MainStage } from "@/components/Stage";

export default function ProjectionPage() {

  return (
    <>
      <RealtimeContextProvider isLobby={false} isAudience={false}>
        <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
          <MainStage
            showAmbientCopresenceOverlay={false}
            showVideoSurface={false}
            showAudioPlayer={false}
          />
        </div>
      </RealtimeContextProvider>
    </>
  );
}


