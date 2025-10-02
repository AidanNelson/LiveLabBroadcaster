import { useEffect, useRef, useState, useCallback } from "react";
import debug from "debug";
const logger = debug("broadcaster:useUserMedia");

const DEFAULT_AUDIO_DEVICE_CONSTRAINTS = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  voiceIsolation: false,
};


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
  const [desiredAudioDeviceConstraints, setDesiredAudioDeviceConstraints] = useState(DEFAULT_AUDIO_DEVICE_CONSTRAINTS);
  const [availableAudioDeviceContraints, setAvailableAudioDeviceContraints] = useState({});

  const [currentAudioDeviceSettings, setCurrentAudioDeviceSettings] = useState(DEFAULT_AUDIO_DEVICE_CONSTRAINTS);

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
          ...desiredAudioDeviceConstraints
        },
        video: { deviceId: { exact: currentVideoDeviceId } },
      };

      logger("Fetching new stream with constraints:", constraints);

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      try {
        const audioTrack = newStream.getAudioTracks()[0];

        const capabilities = audioTrack.getCapabilities();
        const settings = audioTrack.getSettings();
        const constraints = audioTrack.getConstraints();

        // Filter available constraints from DEFAULT_AUDIO_DEVICE_CONSTRAINTS
        const availableConstraints = {};
        Object.keys(DEFAULT_AUDIO_DEVICE_CONSTRAINTS).forEach(constraint => {
          if (Object.keys(capabilities).includes(constraint)) {
            availableConstraints[constraint] = capabilities[constraint];
          }
        });

        console.log("Available constraints from default:", availableConstraints);
        setAvailableAudioDeviceContraints(availableConstraints);
        setCurrentAudioDeviceSettings(settings);

        console.log("Capabilities:\n" + JSON.stringify(capabilities, null, 2) + "\n\n");
        console.log("Settings (actual applied values):\n" + JSON.stringify(settings, null, 2) + "\n\n");
        console.log("Constraints (what was requested):\n" + JSON.stringify(constraints, null, 2) + "\n\n");
      } catch (err) {
        console.error("Error: " + err.message);
      }

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
  }, [currentAudioDeviceId, currentVideoDeviceId, useAudioProcessing, desiredAudioDeviceConstraints]);

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
      try {
        logger("Requesting devices from browser");
        // first request access to all devices, before populating devicesInfo
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        try {
          const audioTrack = stream.getAudioTracks()[0];

          const capabilities = audioTrack.getCapabilities();
          const settings = audioTrack.getSettings();
          const constraints = audioTrack.getConstraints();

          console.log("Capabilities:\n" + JSON.stringify(capabilities, null, 2) + "\n\n");
          console.log("Settings (actual applied values):\n" + JSON.stringify(settings, null, 2) + "\n\n");
          console.log("Constraints (what was requested):\n" + JSON.stringify(constraints, null, 2) + "\n\n");
        } catch (err) {
          console.error("Error: " + err.message);
        }
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
        logger("Error: " + err.message);
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
    availableAudioDeviceContraints,
    desiredAudioDeviceConstraints,
    setDesiredAudioDeviceConstraints,
    currentAudioDeviceSettings
  };
};
