"use client";

import { StageEditor } from "@/components/Editor";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { RealtimeContextProvider, useRealtimeContext } from "@/components/RealtimeContext";
import { useState, useEffect } from "react";
import { BroadcastStreamControls } from "@/components/BroadcastStreamControls";
import { LobbyAdmin } from "@/components/Lobby/admin";
import { useSearchParams } from "next/navigation";
import { useAudienceCountsContext } from "@/components/AudienceCountContext";

const AudienceCountsUpdater = () => {
  const { setAudienceCounts } = useAudienceCountsContext();

  const { socket } = useRealtimeContext();

  useEffect(() => {
    if (!socket) return;

    const onAudienceUpdate = (counts) => {
      console.log("Audience counts updated:", counts);
      setAudienceCounts(counts);
    };

    socket.on("counts", onAudienceUpdate);

    const audienceCountsInterval = setInterval(() => {
      socket.emit("getCounts");
    }, 1000);

    return () => {
      socket.off("counts", onAudienceUpdate);
      clearInterval(audienceCountsInterval);
    };
  }, [socket, setAudienceCounts]);

  return null;
};

export default function Stage() {
  const { editorStatus } = useEditorContext();
  const [currentActiveTab, setCurrentActiveTab] = useState("lobby");
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab");

  useEffect(() => {
    if (tab && ["lobby", "stage", "stream"].includes(tab)) {
      setCurrentActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    // adds a warning before leaving page
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // required for Chrome
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      {editorStatus.isEditor && (
        <>
          <div className={`${currentActiveTab === "stage" ? "" : "hidden"}`}>
            <RealtimeContextProvider isLobby={false}>
              <AudienceCountsUpdater />
              <StageEditor />
            </RealtimeContextProvider>
          </div>

          <div className={`${currentActiveTab === "stream" ? "" : "hidden"}`}>
            <RealtimeContextProvider isLobby={false}>
              <BroadcastStreamControls />
            </RealtimeContextProvider>
          </div>

          <div className={`${currentActiveTab === "lobby" ? "" : "hidden"}`}>
            <RealtimeContextProvider isLobby={true}>
              <LobbyAdmin />
            </RealtimeContextProvider>
          </div>
        </>
      )}
    </>
  );
}
