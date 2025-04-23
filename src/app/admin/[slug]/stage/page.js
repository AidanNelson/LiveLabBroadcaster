"use client";

import { StageEditor } from "@/components/Editor";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { RealtimeContextProvider } from "@/components/RealtimeContext";

export default function Stage() {
  const { editorStatus } = useEditorContext();

  return (
    <>
      {editorStatus.isEditor && (
        <RealtimeContextProvider isLobby={false}>
          <StageEditor />
        </RealtimeContextProvider>
      )}
    </>
  );
}
