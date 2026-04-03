import { useEffect, useRef, useState, useCallback } from "react";
import debug from "debug";
const logger = debug("broadcaster:useUserMedia");

export const useUserMedia = () => {
  const [localStream, setLocalStream] = useState(null);
  const [hasRequestedMediaDevices, setHasRequestedMediaDevices] =
    useState(false);
  const [devicesInfo, setDevicesInfo] = useState([]);
  const [mediaError, setMediaError] = useState(null);

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
        track.enabled = state !== undefined ? state : !track.enabled;
        setMicrophoneEnabled(track.enabled);
      });
    }
  };

  const toggleCameraEnabled = (state) => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks.forEach((track) => {
        track.enabled = state !== undefined ? state : !track.enabled;
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
          channelCount: { ideal: 2 },
          echoCancellation: useAudioProcessing,
          noiseSuppression: useAudioProcessing,
          autoGainControl: useAudioProcessing,
        },
        video: {
          deviceId: { exact: currentVideoDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      };

      logger("Fetching new stream with constraints:", constraints);

      try {
        setMediaError(null);
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        newStream.getVideoTracks().forEach((track) => {
          track.enabled = cameraEnabled;
        });
        newStream.getAudioTracks().forEach((track) => {
          track.enabled = microphoneEnabled;
        });
        setLocalStream((prevStream) => {
          if (prevStream) {
            prevStream.getTracks().forEach((track) => {
              prevStream.removeTrack(track);
              track.stop();
            });
          }

          return newStream;
        });
      } catch (err) {
        logger("getUserMedia error:", err);
        if (err.name === "NotAllowedError") {
          setMediaError("Camera/microphone permission denied. Please allow access in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setMediaError("No camera or microphone found. Please connect a device and try again.");
        } else if (err.name === "NotReadableError") {
          setMediaError("Camera or microphone is in use by another application.");
        } else {
          setMediaError(`Could not access media devices: ${err.message}`);
        }
      }
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
      try {
        setMediaError(null);
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
      } catch (err) {
        logger("Device enumeration error:", err);
        if (err.name === "NotAllowedError") {
          setMediaError("Camera/microphone permission denied. Please allow access in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setMediaError("No camera or microphone found. Please connect a device and try again.");
        } else {
          setMediaError(`Could not access media devices: ${err.message}`);
        }
      }
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
    mediaError,
  };
};
