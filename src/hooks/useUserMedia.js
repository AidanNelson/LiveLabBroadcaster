import { useEffect, useRef, useState, useCallback } from "react";
import debug from 'debug';
const logger = debug('broadcaster:useUserMedia');

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

  const toggleMicrophoneEnabled = (state) => {
    if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks.forEach((track) => {
        track.enabled = state? state : !track.enabled; // Toggle mute
        setMicrophoneEnabled(track.enabled);
      });
    }
  };

  const toggleCameraEnabled = (state) => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks.forEach((track) => {
        track.enabled = state? state : !track.enabled; // Toggle mute
        setCameraEnabled(track.enabled);
      });
    }
  };

  // const getInitialLocalMediaStream = useCallback(
  //   async (videoDeviceId, audioDeviceId) => {
  //     logger("getting local stream");

  //     navigator.mediaDevices
  //       .getUserMedia({
  //         audio: { deviceId: { exact: audioDeviceId } },
  //         video: { deviceId: { exact: videoDeviceId } },
  //       })
  //       .then((stream) => {
  //         logger(
  //           "got stream",
  //           stream.getVideoTracks(),
  //           stream.getAudioTracks(),
  //         );
  //         logger(stream);
  //         setLocalStream(stream);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //       });
  //   },
  //   [setLocalStream],
  // );

  useEffect(() => {
    async function updateStream() {
      // update constraints based on change in deviceId
      // if (!localStream) return;
      if (!currentAudioDeviceId || !currentVideoDeviceId) return;

      const constraints = {
        audio: { deviceId: { exact: currentAudioDeviceId } },
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
  }, [currentAudioDeviceId, currentVideoDeviceId]);

  const switchDevice = useCallback(
    async ({ deviceId, kind }) => {
      if (!localStream) return;

      // const kinds = {
      //   audioinput: "audio",
      //   videoinput: "video",
      // };
      // const constraints = {};
      if (kind === "audioinput") {
        setCurrentAudioDeviceId(deviceId);
        // constraints.audio = { deviceId: { exact: deviceId } };
      } else if (kind === "videoinput") {
        setCurrentVideoDeviceId(deviceId);
        // constraints.video = { deviceId: { exact: deviceId } };
      }

      // try {
      //   const newStream =
      //     await navigator.mediaDevices.getUserMedia(constraints);
      //   // logger('newstream:',newStream);
      //   // logger('tracks:',newStream.getTracks()[0]);
      //   const newTrack = newStream
      //     .getTracks()
      //     .find((track) => track.kind === kinds[kind]);

      //   const oldTrack = localStream
      //     .getTracks()
      //     .find((track) => track.kind === kinds[kind]);

      //   if (oldTrack) {
      //     localStream.removeTrack(oldTrack);
      //     oldTrack.stop();
      //   }

      //   logger("adding track ", newTrack);

      //   localStream.addTrack(newTrack);

      //   // set new track to be enabled or not based on existing camera / mic status
      //   newTrack.enabled = kind === "video" ? cameraEnabled : microphoneEnabled;
      // } catch (error) {
      //   console.error("Error switching device:", error);
      // }
    },
    [localStream, cameraEnabled, microphoneEnabled],
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
      // await getInitialLocalMediaStream(
      //   firstCamera?.deviceId,
      //   firstMicrophone?.deviceId,
      // );
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
  };
};
