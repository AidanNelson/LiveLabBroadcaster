"use client";

import { createContext, useContext, useState } from "react";

export const AudienceCountsContext = createContext();

export const AudienceCountsContextProvider = ({ children }) => {
  const [audienceCounts, setAudienceCounts] = useState({
    lobby: 0,
    stage: 0,
  });

  return (
    <AudienceCountsContext.Provider
      value={{
        audienceCounts,
        setAudienceCounts
      }}
    >
      {children}
    </AudienceCountsContext.Provider>
  );
};

export const useAudienceCountsContext = () => {
  return useContext(AudienceCountsContext);
};
