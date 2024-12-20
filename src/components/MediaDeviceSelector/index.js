import { useEffect, useRef } from "react";
import { useUserMediaContext } from "@/components/UserMediaContext";
import styles from "./MediaDeviceSelector.module.scss"

export const MediaDeviceSelector = () => {
  const { devicesInfo, switchDevice } = useUserMediaContext();

  useEffect(() => {
    console.log("devicesInfo in selector", devicesInfo);
  }, [devicesInfo]);

  return (
    <>
      <div className={styles.selectors}>
        <div className={styles.selectRow}>
          <label for="videoSource" className={styles.screenReaderOnly}>Camera</label>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 22 32" fill="none">
  <path d="M20.3332 13.3334V16C20.3332 18.4754 19.3498 20.8494 17.5995 22.5997C15.8492 24.35 13.4752 25.3334 10.9998 25.3334M10.9998 25.3334C8.52448 25.3334 6.15051 24.35 4.40017 22.5997C2.64983 20.8494 1.6665 18.4754 1.6665 16V13.3334M10.9998 25.3334V30.6667M5.6665 30.6667H16.3332M10.9998 1.33337C9.93897 1.33337 8.92156 1.7548 8.17141 2.50495C7.42126 3.25509 6.99984 4.27251 6.99984 5.33337V16C6.99984 17.0609 7.42126 18.0783 8.17141 18.8285C8.92156 19.5786 9.93897 20 10.9998 20C12.0607 20 13.0781 19.5786 13.8283 18.8285C14.5784 18.0783 14.9998 17.0609 14.9998 16V5.33337C14.9998 4.27251 14.5784 3.25509 13.8283 2.50495C13.0781 1.7548 12.0607 1.33337 10.9998 1.33337Z" stroke="#B3B3B3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
          <select
            id="videoSource"
            onChange={(e) =>
              switchDevice({ deviceId: e.target.value, kind: "videoinput" })
            }
          >
            {devicesInfo
              .filter((device) => device.kind === "videoinput")
              .map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
          </select>
        </div>
        <div className={styles.selectRow}>
          <label for="audioSource" className={styles.screenReaderOnly}>Mic</label>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 22 32" fill="none">
  <path d="M20.3332 13.3334V16C20.3332 18.4754 19.3498 20.8494 17.5995 22.5997C15.8492 24.35 13.4752 25.3334 10.9998 25.3334M10.9998 25.3334C8.52448 25.3334 6.15051 24.35 4.40017 22.5997C2.64983 20.8494 1.6665 18.4754 1.6665 16V13.3334M10.9998 25.3334V30.6667M5.6665 30.6667H16.3332M10.9998 1.33337C9.93897 1.33337 8.92156 1.7548 8.17141 2.50495C7.42126 3.25509 6.99984 4.27251 6.99984 5.33337V16C6.99984 17.0609 7.42126 18.0783 8.17141 18.8285C8.92156 19.5786 9.93897 20 10.9998 20C12.0607 20 13.0781 19.5786 13.8283 18.8285C14.5784 18.0783 14.9998 17.0609 14.9998 16V5.33337C14.9998 4.27251 14.5784 3.25509 13.8283 2.50495C13.0781 1.7548 12.0607 1.33337 10.9998 1.33337Z" stroke="#B3B3B3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
          <select
            id="audioSource"
            onChange={(e) =>
              switchDevice({ deviceId: e.target.value, kind: "audioinput" })
            }
          >
            {devicesInfo
              .filter((device) => device.kind === "audioinput")
              .map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
          </select>
        </div>
      </div>
    </>
  );
};


// export const MediaDeviceSelector = ({ localStream, setLocalStream }) => {
//   const videoInputSelectRef = useRef();
//   const audioInputSelectRef = useRef();
//   const audioOutputSelectRef = useRef();

//   useEffect(() => {
//     // user media
//     const selectors = [
//       audioInputSelectRef.current,
//       audioOutputSelectRef.current,
//       videoInputSelectRef.current,
//     ];

//     audioOutputSelectRef.current.disabled = !(
//       "sinkId" in HTMLMediaElement.prototype
//     );
//     audioInputSelectRef.current.addEventListener("change", startStream);
//     videoInputSelectRef.current.addEventListener("change", startStream);
//     audioOutputSelectRef.current.addEventListener(
//       "change",
//       changeAudioDestination,
//     );

//     async function getDevices() {
//       console.log("getting devices");
//       await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
//       let devicesInfo = await navigator.mediaDevices.enumerateDevices();
//       gotDevices(devicesInfo);
//       console.log(devicesInfo);
//       await startStream();
//     }

//     function gotDevices(deviceInfos) {
//       // Handles being called several times to update labels. Preserve values.
//       const values = selectors.map((select) => select.value);
//       selectors.forEach((select) => {
//         while (select.firstChild) {
//           select.removeChild(select.firstChild);
//         }
//       });
//       for (let i = 0; i !== deviceInfos.length; ++i) {
//         const deviceInfo = deviceInfos[i];
//         const option = document.createElement("option");
//         option.value = deviceInfo.deviceId;
//         if (deviceInfo.kind === "audioinput") {
//           option.text =
//             deviceInfo.label ||
//             `microphone ${audioInputSelectRef.current.length + 1}`;
//           audioInputSelectRef.current.appendChild(option);
//         } else if (deviceInfo.kind === "audiooutput") {
//           option.text =
//             deviceInfo.label ||
//             `speaker ${audioOutputSelectRef.current.length + 1}`;
//           audioOutputSelectRef.current.appendChild(option);
//         } else if (deviceInfo.kind === "videoinput") {
//           option.text =
//             deviceInfo.label ||
//             `camera ${videoInputSelectRef.current.length + 1}`;
//           videoInputSelectRef.current.appendChild(option);
//         } else {
//           console.log("Some other kind of source/device: ", deviceInfo);
//         }
//       }
//       selectors.forEach((select, selectorIndex) => {
//         if (
//           Array.prototype.slice
//             .call(select.childNodes)
//             .some((n) => n.value === values[selectorIndex])
//         ) {
//           select.value = values[selectorIndex];
//         }
//       });
//     }

//     function gotStream(stream) {
//       setLocalStream(stream);

//       // Refresh button list in case labels have become available
//       return navigator.mediaDevices.enumerateDevices();
//     }

//     function handleError(error) {
//       console.log(
//         "navigator.MediaDevices.getUserMedia error: ",
//         error.message,
//         error.name,
//       );
//     }

//     // Attach audio output device to video element using device/sink ID.
//     function attachSinkId(element, sinkId) {
//       if (typeof element.sinkId !== "undefined") {
//         element
//           .setSinkId(sinkId)
//           .then(() => {
//             console.log(`Success, audio output device attached: ${sinkId}`);
//           })
//           .catch((error) => {
//             let errorMessage = error;
//             if (error.name === "SecurityError") {
//               errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
//             }
//             console.error(errorMessage);
//             // Jump back to first output device in the list as it's the default.
//             audioOutputSelectRef.current.selectedIndex = 0;
//           });
//       } else {
//         console.warn("Browser does not support output device selection.");
//       }
//     }

//     function changeAudioDestination() {
//       const audioDestination = audioOutputSelectRef.current.value;
//       attachSinkId(videoElement, audioDestination);
//     }

//     async function startStream() {
//       console.log("getting local stream");

//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           track.stop();
//         });
//       }

//       const audioSource = audioInputSelectRef.current.value;
//       const videoSource = videoInputSelectRef.current.value;
//       const constraints = {
//         audio: audioSource
//           ? { deviceId: audioSource ? { exact: audioSource } : undefined,
//             echoCancellation: false,
//             noiseSuppression: false,
//             autoGainControl: false,}
//           : false,
//         video: {
//           deviceId: videoSource ? { exact: videoSource } : undefined,
//         },
//       };
//       console.log(constraints);
//       navigator.mediaDevices
//         .getUserMedia(constraints)
//         .then(gotStream)
//         .then(gotDevices)
//         .catch(handleError);
//     }

//     getDevices();
//   }, []);

//   return (
//     <>
//       <div>
//         <label for="videoSource">Camera</label>
//         <select ref={videoInputSelectRef} id="videoSource"></select>
//       </div>

//       <div>
//         <label for="audioSource">Microphone</label>
//         <select ref={audioInputSelectRef} id="audioSource"></select>
//       </div>

//       <div style={{display: 'none'}}>
//         <label for="audioOutput">Audio output destination: </label>
//         <select ref={audioOutputSelectRef} id="audioOutput"></select>
//       </div>
//     </>
//   );
// };
