"use client";

import { useEffect, useState } from "react";
import { AudienceOnboarding } from "@/components/AudienceOnboarding";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { LobbyContextProvider } from "@/components/Lobby/LobbyContextProvider";
import { LobbyInner } from "@/components/Lobby";
import styles from "./Lobby.module.scss";

export default function Lobby() {
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
            {hasCompletedOnboarding && (
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
