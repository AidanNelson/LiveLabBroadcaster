"use client";

import React, { createContext, useContext } from "react";
import { useUserMedia } from "@/hooks/useUserMedia";

export const UserMediaContext = createContext();

export const UserMediaContextProvider = ({ children }) => {
  const {
    localStream,
    hasRequestedMediaDevices,
    setHasRequestedMediaDevices,
    devicesInfo,
    switchDevice,
    skippedMediaDeviceSetup,
    setSkippedMediaDeviceSetup,
    cameraEnabled,
    microphoneEnabled,
    toggleCameraEnabled,
    toggleMicrophoneEnabled,
  } = useUserMedia();

  return (
    <UserMediaContext.Provider
      value={{
        localStream,
        hasRequestedMediaDevices,
        setHasRequestedMediaDevices,
        devicesInfo,
        switchDevice,
        skippedMediaDeviceSetup,
        setSkippedMediaDeviceSetup,
        cameraEnabled,
        microphoneEnabled,
        toggleCameraEnabled,
        toggleMicrophoneEnabled,
      }}
    >
      {children}
    </UserMediaContext.Provider>
  );
};

export const useUserMediaContext = () => {
  return useContext(UserMediaContext);
};
