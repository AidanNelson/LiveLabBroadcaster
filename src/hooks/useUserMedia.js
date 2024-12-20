import { useEffect, useRef, useState, useCallback } from "react";

export const useUserMedia = () => {
  const [localStream, setLocalStream] = useState(null);
  const [hasRequestedMediaDevices, setHasRequestedMediaDevices] =
    useState(false);
  const [devicesInfo, setDevicesInfo] = useState([]);
  const [skippedMediaDeviceSetup, setSkippedMediaDeviceSetup] = useState(false);

  const startStream = useCallback(async () => {
    console.log("getting local stream");

    navigator.mediaDevices
      .getUserMedia({audio: true, video: true})
      .then((stream) => {
        console.log("got stream", stream.getVideoTracks(), stream.getAudioTracks())
        setLocalStream((prevStream) => {
          if (prevStream) {
            prevStream.getTracks().forEach((track) => {
              track.stop();
            });
          }
          return stream;
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [localStream, setLocalStream]);

  const switchDevice = useCallback(async ({ deviceId, kind }) => {
    if (!localStream) return;

    const kinds = {
      audioinput: "audio",
      videoinput: "video",
    }
    const constraints = {};
    if (kind === "audioinput") {
      constraints.audio = { deviceId: { exact: deviceId } };
    } else if (kind === "videoinput") {
      constraints.video = { deviceId: { exact: deviceId } };
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      // console.log('newstream:',newStream);
      // console.log('tracks:',newStream.getTracks()[0]);
      const newTrack = newStream
        .getTracks()
        .find((track) => track.kind === kinds[kind]);

      const oldTrack = localStream
        .getTracks()
        .find((track) => track.kind === kinds[kind]);

      if (oldTrack) {
        localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }

      console.log("adding track ", newTrack);

      localStream.addTrack(newTrack);
      // setLocalStream(localStream);
    } catch (error) {
      console.error("Error switching device:", error);
    }
  }, [localStream]);

  useEffect(() => {
    if (!hasRequestedMediaDevices) return;

    async function getDevices() {
      console.log("getting devices");
      // first request access to all devices, before populating devicesInfo
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      let devicesInfo = await navigator.mediaDevices.enumerateDevices();
      setDevicesInfo(devicesInfo);
      await startStream();
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
    setSkippedMediaDeviceSetup 
  };
};