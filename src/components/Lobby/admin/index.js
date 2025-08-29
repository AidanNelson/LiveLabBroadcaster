"use client";

import { useState } from "react";

import { LobbyContextProvider } from "@/components/Lobby/LobbyContextProvider";
import { AudienceOnboarding } from "@/components/AudienceOnboarding";
import { LobbyInner } from "@/components/Lobby";
import { ThreePanelLayout } from "@/components/ThreePanelLayout";
import Typography from "@/components/Typography";
import { FlexPanel } from "@/components/Editor/FlexPanel";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { ThreeCanvasDropzone } from "@/components/ThreeCanvas/Dropzone";
import { AnnouncementList } from "./announcements";

const LobbyAdminLeftPanel = () => {
  return (
    <>
    <div className="p-4">
      <Typography variant={"subtitle"}>Announcements</Typography>
      <AnnouncementList />
      </div>
    </>
  );
};
const LobbyPreview = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { editorStatus } = useEditorContext();

  return (
    <>
      {!hasCompletedOnboarding && (
        <AudienceOnboarding
          hasCompletedOnboarding={hasCompletedOnboarding}
          setHasCompletedOnboarding={setHasCompletedOnboarding}
        />
      )}
      {hasCompletedOnboarding && (
        <>
          {editorStatus.isEditor && <ThreeCanvasDropzone />}

          <LobbyInner />
        </>
      )}
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
