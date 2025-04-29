"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "@/components/AuthContextProvider";
import { useStageContext } from "@/components/StageContext";

export const EditorContext = createContext();

export const EditorContextProvider = ({ children }) => {
  const { user } = useAuthContext();
  const { stageInfo } = useStageContext();
  const [editorStatus, setEditorStatus] = useState({
    isEditor: false,
    editorIsOpen: true,
    target: null,
    type: "menu",
    bottomPanelOpen: true,
    sidePanelOpen: false,
    currentEditor: "script",
  });

  useEffect(() => {
    if (!stageInfo || !user) return;
    
    if (stageInfo?.collaborator_ids?.includes(user.id)) {
      setEditorStatus({ ...editorStatus, isEditor: true });
    }
  }, [stageInfo, user]);

  return (
    <EditorContext.Provider value={{ editorStatus, setEditorStatus }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const { editorStatus, setEditorStatus } = useContext(EditorContext);

  return { editorStatus, setEditorStatus };
};
