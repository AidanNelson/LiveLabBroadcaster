"use client";

import React, { createContext, useContext } from "react";
import { useUserMedia } from "@/hooks/useUserMedia";

export const UserMediaContext = createContext();

export const UserMediaContextProvider = ({ children }) => {
  const { localStream, hasRequestedMediaDevices, setHasRequestedMediaDevices, devicesInfo, switchDevice } = useUserMedia();

  return (
    <UserMediaContext.Provider
      value={{ localStream, hasRequestedMediaDevices, setHasRequestedMediaDevices, devicesInfo, switchDevice }}>
      {children}
    </UserMediaContext.Provider>
  );
};

export const useUserMediaContext = () => {
  return useContext(UserMediaContext);
};
