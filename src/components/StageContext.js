import React, { createContext } from "react";

export const StageContext = createContext();

export const StageContextProvider = ({ stageId, children }) => {
  return (
    <StageContext.Provider value={{ stageId }}>
      {children}
    </StageContext.Provider>
  );
};
