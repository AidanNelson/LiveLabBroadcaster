import React, { createContext } from "react";

export const StageContext = createContext();

export const StageContextProvider = ({ stageInfo, children }) => {
  return (
    <StageContext.Provider value={ stageInfo }>
      {children}
    </StageContext.Provider>
  );
};
