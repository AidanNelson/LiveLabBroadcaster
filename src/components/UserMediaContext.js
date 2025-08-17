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
    currentVideoDeviceId,
    currentAudioDeviceId,
    setUseAudioProcessing,
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
        currentVideoDeviceId,
        currentAudioDeviceId,
        setUseAudioProcessing,
      }}
    >
      {children}
    </UserMediaContext.Provider>
  );
};

export const useUserMediaContext = () => {
  return useContext(UserMediaContext);
};
