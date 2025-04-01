"use client";

import { EditorView } from "@/components/Editor";
import { useEditorContext } from "@/components/Editor/EditorContext";

const StageInner = () => {
  const { editorStatus } = useEditorContext();

  return <>{editorStatus.isEditor && <EditorView />}</>;
};

export default function Stage() {
  return (
    <>
      <StageInner />
    </>
  );
}
