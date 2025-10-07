"use client";

import { useState } from "react";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { LobbyContextProvider } from "@/components/Lobby/LobbyContextProvider";
import { LobbyInner } from "@/components/Lobby";
import styles from "./Lobby.module.scss";
import { AudienceOnboarding } from "@/components/AudienceOnboarding";
import { useStageContext } from "@/components/StageContext";

export default function Lobby() {
  const {stageInfo} = useStageContext();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);



  return (
    <>
      <RealtimeContextProvider isLobby={true}>
        <LobbyContextProvider>
          <div className={styles.lobbyContainer}>
            {!hasCompletedOnboarding && (
              <AudienceOnboarding
                hasCompletedOnboarding={hasCompletedOnboarding}
                setHasCompletedOnboarding={setHasCompletedOnboarding}
                onboardingFor="lobby"
              />
            )}
            {hasCompletedOnboarding && stageInfo && (
              <>
                <LobbyInner />
              </>
            )}
          </div>
        </LobbyContextProvider>
      </RealtimeContextProvider>
    </>
  );
}
