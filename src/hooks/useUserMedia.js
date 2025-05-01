import { useEffect, useRef, useState, useCallback } from "react";
import debug from "debug";
const logger = debug("broadcaster:useUserMedia");

export const VIDEO_RESOLUTION_PRESETS = {
  unset: {},
  "320x240": { width: { ideal: 320 }, height: { ideal: 240 } },
  "640x480": { width: { ideal: 640 }, height: { ideal: 480 } },
  "1280x720": { width: { ideal: 1280 }, height: { ideal: 720 } },
  "1920x1080": { width: { ideal: 1920 }, height: { ideal: 1080 } },
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
  const [videoResolution, setVideoResolution] = useState("unset");

  const getResolutionConstraints = (input) => {
    if (input == null) return undefined;

    if (typeof input === "string") {
      return VIDEO_RESOLUTION_PRESETS[input.toLowerCase()] || undefined;
    }

    if (typeof input === "object" && input.width && input.height) {
      return input;
    }

    return undefined;
  };

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
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          localStream.removeTrack(track);
          track.stop();
        });
      }

      const resolutionConstraints = getResolutionConstraints(videoResolution);

      const constraints = {
        audio: {
          deviceId: { exact: currentAudioDeviceId },
          echoCancellation: useAudioProcessing,
          noiseSuppression: useAudioProcessing,
          autoGainControl: useAudioProcessing,
        },
        video: {
          deviceId: { exact: currentVideoDeviceId },
          ...(resolutionConstraints ?? {}), // only apply if not undefined
        },
      };

      logger("Video constraints:", constraints.video);



      logger("Fetching new stream with constraints:", constraints);

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      logger("New stream video settings:", newStream.getVideoTracks()[0].getSettings());

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
  }, [
    currentAudioDeviceId,
    currentVideoDeviceId,
    useAudioProcessing,
    videoResolution,
  ]);

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
      const initialStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      initialStream.getTracks().forEach((track) => {
        initialStream.removeTrack(track);
        track.stop();
      });

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
    setVideoResolution,
  };
};
