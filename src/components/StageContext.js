"use client";

import React, { createContext, useContext } from "react";
import { useStageInfo } from "@/hooks/useStageInfo";
export const StageContext = createContext();

export const StageContextProvider = ({ slug, children }) => {
  const {
    stageInfo,
    features,
    addFeature,
    updateFeature,
    deleteFeature,
    updateFeatureOrder,
  } = useStageInfo({ slug });

  return (
    <StageContext.Provider
      value={{
        stageInfo,
        features,
        addFeature,
        updateFeature,
        deleteFeature,
        updateFeatureOrder,
      }}
    >
      {children}
    </StageContext.Provider>
  );
};

export const useStageContext = () => {
  return useContext(StageContext);
};
