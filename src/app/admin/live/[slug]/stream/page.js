"use client";

import { StageEditor } from "@/components/Editor";
import { useEditorContext } from "@/components/Editor/EditorContext";
import {
  RealtimeContextProvider,
  useRealtimeContext,
} from "@/components/RealtimeContext";
import { useState, useEffect } from "react";
import { BroadcastStreamControls } from "@/components/BroadcastStreamControls";
import { LobbyAdmin } from "@/components/Lobby/admin";
import { useSearchParams, useRouter } from "next/navigation";
import { useAudienceCountsContext } from "@/components/AudienceCountContext";
import { useStageContext } from "@/components/StageContext";

const AudienceCountsUpdater = () => {
  const { stageInfo } = useStageContext();
  const { setAudienceCounts } = useAudienceCountsContext();

  const { socket } = useRealtimeContext();

  useEffect(() => {
    if (!socket || !stageInfo) return;

    const onAudienceUpdate = (counts) => {
      setAudienceCounts(counts);
    };

    socket.on("counts", onAudienceUpdate);

    const audienceCountsInterval = setInterval(() => {
      socket.emit("getCounts", stageInfo?.id);
    }, 1000);

    return () => {
      socket.off("counts", onAudienceUpdate);
      clearInterval(audienceCountsInterval);
    };
  }, [socket, setAudienceCounts, stageInfo]);

  return null;
};

export default function Stage() {
  const { editorStatus } = useEditorContext();

  useEffect(() => {
    // Handle browser refresh/close and external navigation
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // required for Chrome
    };

    // Handle Next.js client-side navigation by intercepting clicks on links
    const handleLinkClick = (event) => {
      const target = event.target.closest('a[href]');
      if (target && target.href && !target.href.startsWith(window.location.origin + window.location.pathname)) {
        const shouldWarn = window.confirm(
          "Are you sure you want to leave? Your stream will be interrupted."
        );
        if (!shouldWarn) {
          event.preventDefault();
          return false;
        }
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = (event) => {
      const shouldWarn = window.confirm(
        "Are you sure you want to leave? Your stream will be interrupted."
      );
      if (!shouldWarn) {
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);

    // Push initial state to enable popstate detection
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <>
      {editorStatus.isEditor && (
        <>
       
            <RealtimeContextProvider isLobby={false} isAudience={false}>
              <AudienceCountsUpdater />
              <BroadcastStreamControls />
            </RealtimeContextProvider>
         
        </>
      )}
    </>
  );
}
