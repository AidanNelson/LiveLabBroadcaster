"use client";

import { useState } from "react";
import { useStageContext } from "@/components/StageContext";
import { EditorView } from "@/components/Editor";

import { useEditorContext } from "@/components/Editor/EditorContext";
import { MainStage, MainStageControls } from "@/components/Stage";
import { useAuthContext } from "@/components/AuthContextProvider.js";

export const AudienceView = () => {
  return (
    <div
      style={{
        border: "1px solid red",
        width: "100%",
        height: "100%",
      }}
    >
      <MainStage />
      <MainStageControls />
    </div>
  );
};

const StageInner = () => {
  const { stageInfo } = useStageContext();
  const { user } = useAuthContext();

  const { editorStatus, setEditorStatus } = useEditorContext();

  console.log({editorStatus})

  return (
    <>
        {editorStatus.isEditor && <EditorView />}
        {!editorStatus.isEditor && <AudienceView />}
    </>
  );
};

export default function Stage() {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      >
        {!hasInteracted && (
          <div
            style={{
              width: "100%",
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            <button onClick={() => setHasInteracted(true)}>
              <h3>Enter Show</h3>
            </button>
          </div>
        )}
        {hasInteracted && <StageInner />}
      </div>
    </>
  );
}
