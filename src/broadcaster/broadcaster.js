import { io } from "socket.io-client";
import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";

let socket;
let mediasoupPeer;
let localCam;

let videoEncodings = [
  { scaleResolutionDownBy: 4, maxBitrate: 500000 },
  { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
  { scaleResolutionDownBy: 1, maxBitrate: 5000000 },
];
let audioEncodings = [{ maxBitrate: 256000 }];

async function startBroadcast() {
  let videoTrack = localCam.getVideoTracks()[0];
  mediasoupPeer.addTrack(videoTrack, "video-broadcast", true, videoEncodings);
  let audioTrack = localCam.getAudioTracks()[0];
  mediasoupPeer.addTrack(audioTrack, "audio-broadcast", true, audioEncodings);
}

async function main() {
  console.log("~~~~~~~~~~~~~~~~~");

  socket = io(process.env.SERVER_URL, {
    path: "/socket.io",
  });

  socket.on("connect", () => {
    console.log("Socket ID: ", socket.id); // x8WIv7-mJelg7on_ALbx
  });

  mediasoupPeer = new SimpleMediasoupPeer(socket);

  await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  getDevices();

  document.getElementById("startBroadcast").addEventListener(
    "click",
    () => {
      startBroadcast();
    },
    false
  );
}

main();

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// user media

const videoElement = document.getElementById("local_video");
const audioInputSelect = document.querySelector("select#audioSource");
const audioOutputSelect = document.querySelector("select#audioOutput");
const videoInputSelect = document.querySelector("select#videoSource");
const selectors = [audioInputSelect, audioOutputSelect, videoInputSelect];

audioOutputSelect.disabled = !("sinkId" in HTMLMediaElement.prototype);
audioInputSelect.addEventListener("change", startStream);
videoInputSelect.addEventListener("change", startStream);
audioOutputSelect.addEventListener("change", changeAudioDestination);

async function getDevices() {
  let devicesInfo = await navigator.mediaDevices.enumerateDevices();
  gotDevices(devicesInfo);
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
        deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === "audiooutput") {
      option.text =
        deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `camera ${videoInputSelect.length + 1}`;
      videoInputSelect.appendChild(option);
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
  localCam = stream; // make stream available to console
  console.log(stream);

  const videoTrack = localCam.getVideoTracks()[0];
  const audioTrack = localCam.getAudioTracks()[0];
  console.log(audioTrack);
  console.log(videoTrack);

  let videoStream = new MediaStream([videoTrack]);
  if ("srcObject" in videoElement) {
    videoElement.srcObject = videoStream;
  } else {
    videoElement.src = window.URL.createObjectURL(videoStream);
  }

  videoElement.play();

  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name
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
        audioOutputSelect.selectedIndex = 0;
      });
  } else {
    console.warn("Browser does not support output device selection.");
  }
}

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(videoElement, audioDestination);
}

async function startStream() {
  console.log("getting local stream");
  if (localCam) {
    localCam.getTracks().forEach((track) => {
      track.stop();
    });
  }

  const audioSource = audioInputSelect.value;
  const videoSource = videoInputSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: {
      deviceId: videoSource ? { exact: videoSource } : undefined,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .then(gotDevices)
    .catch(handleError);
}
