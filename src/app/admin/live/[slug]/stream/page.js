"use client";

import { useEditorContext } from "@/components/Editor/EditorContext";
import {
  RealtimeContextProvider,
  useRealtimeContext,
} from "@/components/RealtimeContext";
import { useEffect } from "react";
import { BroadcastStreamControls } from "@/components/BroadcastStreamControls";
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

  return (
    <>
      {editorStatus.isEditor && (
        <RealtimeContextProvider isLobby={false} isAudience={false}>
          <AudienceCountsUpdater />
          <BroadcastStreamControls />
        </RealtimeContextProvider>
      )}
    </>
  );
}
