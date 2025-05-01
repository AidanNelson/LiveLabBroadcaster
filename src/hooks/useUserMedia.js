import { useEffect, useRef, useState, useCallback } from "react";
import debug from "debug";
const logger = debug("broadcaster:useUserMedia");

export const useUserMedia = () => {
  const [localStream, setLocalStream] = useState(null);
  const [hasRequestedMediaDevices, setHasRequestedMediaDevices] =
    useState(false);
  const [devicesInfo, setDevicesInfo] = useState([]);

  const [currentVideoDeviceId, setCurrentVideoDeviceId] = useState(null);
  const [currentAudioDeviceId, setCurrentAudioDeviceId] = useState(null);

  const [skippedMediaDeviceSetup, setSkippedMediaDeviceSetup] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

  const [useAudioProcessing, setUseAudioProcessing] = useState(false);

  const toggleMicrophoneEnabled = (state) => {
    if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks.forEach((track) => {
        track.enabled = state ? state : !track.enabled; // Toggle mute
        setMicrophoneEnabled(track.enabled);
      });
    }
  };

  const toggleCameraEnabled = (state) => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks.forEach((track) => {
        track.enabled = state ? state : !track.enabled; // Toggle mute
        setCameraEnabled(track.enabled);
      });
    }
  };

  useEffect(() => {
    async function updateStream() {
      if (!currentAudioDeviceId || !currentVideoDeviceId) return;

      const constraints = {
        audio: {
          deviceId: { exact: currentAudioDeviceId },
          echoCancellation: useAudioProcessing,
          noiseSuppression: useAudioProcessing,
          autoGainControl: useAudioProcessing,
        },
        video: { deviceId: { exact: currentVideoDeviceId } },
      };

      logger("Fetching new stream with constraints:", constraints);

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      newStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled; // Set enabled state based on current camera status
      });
      newStream.getAudioTracks().forEach((track) => {
        track.enabled = microphoneEnabled; // Set enabled state based on current microphone status
      });
      setLocalStream((prevStream) => {
        if (prevStream) {
          // Remove old tracks
          prevStream.getTracks().forEach((track) => {
            prevStream.removeTrack(track);
            track.stop();
          });
        }

        return newStream;
      });
    }

    updateStream();
  }, [currentAudioDeviceId, currentVideoDeviceId, useAudioProcessing]);

  const switchDevice = useCallback(
    async ({ deviceId, kind }) => {
      if (!localStream) return;

      if (kind === "audioinput") {
        setCurrentAudioDeviceId(deviceId);
      } else if (kind === "videoinput") {
        setCurrentVideoDeviceId(deviceId);
      }
    },
    [localStream],
  );

  useEffect(() => {
    if (!hasRequestedMediaDevices) return;

    async function getDevices() {
      logger("Requesting devices from browser");
      // first request access to all devices, before populating devicesInfo
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      let devicesInfo = await navigator.mediaDevices.enumerateDevices();
      setDevicesInfo(devicesInfo);
      let firstCamera = devicesInfo.find(
        (device) => device.kind === "videoinput",
      );
      let firstMicrophone = devicesInfo.find(
        (device) => device.kind === "audioinput",
      );

      setCurrentVideoDeviceId(firstCamera?.deviceId);
      setCurrentAudioDeviceId(firstMicrophone?.deviceId);
    }
    getDevices();
  }, [hasRequestedMediaDevices]);

  return {
    localStream,
    hasRequestedMediaDevices,
    setHasRequestedMediaDevices,
    devicesInfo,
    switchDevice,
    skippedMediaDeviceSetup,
    setSkippedMediaDeviceSetup,
    toggleCameraEnabled,
    cameraEnabled,
    microphoneEnabled,
    toggleMicrophoneEnabled,
    currentVideoDeviceId,
    currentAudioDeviceId,
    setUseAudioProcessing,
  };
};
