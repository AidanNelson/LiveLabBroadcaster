"use client";

import { useState } from "react";

import styles from "./Lobby.module.scss";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { LobbyContextProvider } from "@/components/Lobby/LobbyContextProvider";
import { AudienceOnboarding } from "@/components/AudienceOnboarding";
import { LobbyInner } from "@/components/Lobby";

export const LobbyAdmin = () => {
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
              />
            )}
            {hasCompletedOnboarding && <LobbyInner />}
          </div>
        </LobbyContextProvider>
      </RealtimeContextProvider>
    </>
  );
};
