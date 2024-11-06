import React, { createContext, useContext } from "react";

export const StageContext = createContext();

export const StageContextProvider = ({ stageInfo, children }) => {
  return (
    <StageContext.Provider value={{ stageInfo }}>
      {children}
    </StageContext.Provider>
  );
};

export const useStageContext = () => {
  const { stageInfo } = useContext(StageContext);

  return { stageInfo }
}