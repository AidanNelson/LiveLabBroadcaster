import React, { createContext, useContext } from "react";

export const EditorContext = createContext();

export const EditorContextProvider = ({ editorStatus, setEditorStatus, children }) => {
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