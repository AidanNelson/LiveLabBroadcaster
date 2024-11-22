"use client";
import React, { createContext, useContext, useState } from "react";

export const EditorContext = createContext();

export const EditorContextProvider = ({ children }) => {
  const [editorStatus, setEditorStatus] = useState({
    isEditor: false,
    editorIsOpen: true,
    target: null,
    type: "menu",
    bottomPanelOpen: true,
    sidePanelOpen: false,
    currentEditor: "script",
  });


  return (
    <EditorContext.Provider value={{ editorStatus, setEditorStatus }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const { editorStatus, setEditorStatus } = useContext(EditorContext);

  return { editorStatus, setEditorStatus }
}