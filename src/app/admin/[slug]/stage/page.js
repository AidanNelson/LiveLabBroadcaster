"use client";

import { StageEditor } from "@/components/Editor";
import { useEditorContext } from "@/components/Editor/EditorContext";

export default function Stage() {
  const { editorStatus } = useEditorContext();

  return <>{editorStatus.isEditor && <StageEditor />}</>;
}
