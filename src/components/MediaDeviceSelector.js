"use client";
import { useEffect, useRef } from "react";

export const MediaDeviceSelector = ({ localStream, setLocalStream }) => {
  const videoInputSelectRef = useRef();
  const audioInputSelectRef = useRef();
  const audioOutputSelectRef = useRef();

  useEffect(() => {
    // user media
    const selectors = [
      audioInputSelectRef.current,
      audioOutputSelectRef.current,
      videoInputSelectRef.current,
    ];

    audioOutputSelectRef.current.disabled = !(
      "sinkId" in HTMLMediaElement.prototype
    );
    audioInputSelectRef.current.addEventListener("change", startStream);
    videoInputSelectRef.current.addEventListener("change", startStream);
    audioOutputSelectRef.current.addEventListener(
      "change",
      changeAudioDestination,
    );

    async function getDevices() {
      console.log("getting devices");
      let devicesInfo = await navigator.mediaDevices.enumerateDevices();
      gotDevices(devicesInfo);
      console.log(devicesInfo);
      await startStream();
    }

    function gotDevices(deviceInfos) {
      // Handles being called several times to update labels. Preserve values.
      const values = selectors.map((select) => select.value);
      selectors.forEach((select) => {
        while (select.firstChild) {
          select.removeChild(select.firstChild);
        }
      });
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
          option.text =
            deviceInfo.label ||
            `microphone ${audioInputSelectRef.current.length + 1}`;
          audioInputSelectRef.current.appendChild(option);
        } else if (deviceInfo.kind === "audiooutput") {
          option.text =
            deviceInfo.label ||
            `speaker ${audioOutputSelectRef.current.length + 1}`;
          audioOutputSelectRef.current.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
          option.text =
            deviceInfo.label ||
            `camera ${videoInputSelectRef.current.length + 1}`;
          videoInputSelectRef.current.appendChild(option);
        } else {
          console.log("Some other kind of source/device: ", deviceInfo);
        }
      }
      selectors.forEach((select, selectorIndex) => {
        if (
          Array.prototype.slice
            .call(select.childNodes)
            .some((n) => n.value === values[selectorIndex])
        ) {
          select.value = values[selectorIndex];
        }
      });
    }

    function gotStream(stream) {
      setLocalStream(stream);

      // Refresh button list in case labels have become available
      return navigator.mediaDevices.enumerateDevices();
    }

    function handleError(error) {
      console.log(
        "navigator.MediaDevices.getUserMedia error: ",
        error.message,
        error.name,
      );
    }

    // Attach audio output device to video element using device/sink ID.
    function attachSinkId(element, sinkId) {
      if (typeof element.sinkId !== "undefined") {
        element
          .setSinkId(sinkId)
          .then(() => {
            console.log(`Success, audio output device attached: ${sinkId}`);
          })
          .catch((error) => {
            let errorMessage = error;
            if (error.name === "SecurityError") {
              errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
            }
            console.error(errorMessage);
            // Jump back to first output device in the list as it's the default.
            audioOutputSelectRef.current.selectedIndex = 0;
          });
      } else {
        console.warn("Browser does not support output device selection.");
      }
    }

    function changeAudioDestination() {
      const audioDestination = audioOutputSelectRef.current.value;
      attachSinkId(videoElement, audioDestination);
    }

    async function startStream() {
      console.log("getting local stream");

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      const audioSource = audioInputSelectRef.current.value;
      const videoSource = videoInputSelectRef.current.value;
      const constraints = {
        audio: audioSource
          ? { deviceId: audioSource ? { exact: audioSource } : undefined }
          : false,
        video: {
          deviceId: videoSource ? { exact: videoSource } : undefined,
        },
      };
      console.log(constraints);
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .then(gotDevices)
        .catch(handleError);
    }

    getDevices();
  }, []);

  return (
    <>
      <div>
        <label for="videoSource">Camera</label>
        <select ref={videoInputSelectRef} id="videoSource"></select>
      </div>

      <div>
        <label for="audioSource">Microphone</label>
        <select ref={audioInputSelectRef} id="audioSource"></select>
      </div>

      <div style={{display: 'none'}}>
        <label for="audioOutput">Audio output destination: </label>
        <select ref={audioOutputSelectRef} id="audioOutput"></select>
      </div>
    </>
  );
};
