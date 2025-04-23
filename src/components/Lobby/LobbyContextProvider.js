"use client";

import React, { createContext, useContext } from "react";
import { useLobbyFeatures } from "./useLobbyFeatures";

export const LobbyContext = createContext();

export const LobbyContextProvider = ({ children }) => {
  const { lobbyFeatures, addFeature, updateFeature, deleteFeature } =
    useLobbyFeatures();

  return (
    <LobbyContext.Provider
      value={{ lobbyFeatures, addFeature, updateFeature, deleteFeature }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobbyContext = () => {
  return useContext(LobbyContext);
};
