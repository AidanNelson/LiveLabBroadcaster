"use client";

import React, { createContext, useContext } from "react";
import { useStageInfo } from "@/hooks/useStageInfo";
export const StageContext = createContext();

export const StageContextProvider = ({ slug, children }) => {
  const { stageInfo, features } = useStageInfo({ slug });

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