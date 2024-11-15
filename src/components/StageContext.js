import React, { createContext, useContext } from "react";

export const StageContext = createContext();

export const StageContextProvider = ({ stageInfo, features, children }) => {
  return (
    <StageContext.Provider value={{ stageInfo, features }}>
      {children}
    </StageContext.Provider>
  );
};

export const useStageContext = () => {
  const { stageInfo, features } = useContext(StageContext);

  return { stageInfo, features }
}