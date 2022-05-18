/*
A Few Deep Breaths
CultureHub & LaMaMa ETC, May 2022
*/

import { io } from "socket.io-client";
import { SimpleMediasoupPeer } from "../libs/SimpleMediasoupPeer";

import { Lobby } from "./lobby";

let url = "https://afewdeepbreaths.livelab.app";
let socket;
let mediasoupPeer;
let localCam;

let lobby;
let lobbyUpdateInterval;
let lobbyIsActive = false;

let videoIsTransformed = false;

let peers = {};

function init() {
  console.log("~~~~~~~~~~~~~~~~~");

  socket = io(url, {
    path: "/socket.io",
  });

  lobby = new Lobby(peers, socket);

  socket.on("clients", (ids) => {
    console.log("Got initial clients!");
    for (const id of ids) {
      if (!(id in peers)) {
        console.log("Client conencted: ", id);
        peers[id] = {};
        lobby.addPeer(id);
      }
    }
  });

  socket.on("clientConnected", (id) => {
    console.log("Client conencted: ", id);
    peers[id] = {};
    lobby.addPeer(id);
  });

  socket.on("clientDisconnected", (id) => {
    console.log("Client disconencted:", id);
    lobby.removePeer(id);
    delete peers[id];
  });

  socket.on("userPositions", (data) => {
    lobby.updateClientPositions(data);
  });

  socket.on("sceneIdx", (sceneId) => {
    setScene(sceneId);
  });

  socket.on("adminMessage", (data) => {
    document.getElementById("adminMessageText").innerHTML = data.msg;
  });

  socket.on("chat", (data) => {
    let text = "";
    let messages = data.data;
    for (let i = messages.length - 1; i >= 0; i--) {
      let msg = messages[i].msg;
      console.log(msg);
      text += msg + "\n\n";
    }
    document.getElementById("chatBox").innerText = text;
  });

  document.getElementById("sendChatButton").addEventListener("click", () => {
    let message = document.getElementById("chatMessageInput").value;
    console.log("sending chat message:", message);
    let data = {
      msg: message,
    };
    socket.emit("chat", data);
  });

  document.addEventListener("keyup", (ev) => {
    console.log(ev.key == " ");
    let videoEl = document.getElementById("broadcastVideo");
    if (ev.key == " ") {
      if (videoIsTransformed) {
        videoEl.style.transform = "translateX(-50%) scaleX(2)";
      } else {
        videoEl.style.transform = "translateX(50%) scaleX(2)";
      }
      videoIsTransformed = !videoIsTransformed;
    }
  });

  mediasoupPeer = new SimpleMediasoupPeer(socket);
  mediasoupPeer.on("track", gotTrack);
}

function setScene(sceneId) {
  // let sceneNumberDiv = document.getElementById('currentSceneId');
  // sceneNumberDiv.innerHTML = sceneId;
}

window.onload = init;

function enterLobby() {
  document.getElementById("lobby-controls").style.display = "";
  document.getElementById("lobby-container").style.display = "";
  lobby.start();
  lobbyIsActive = true;
  lobbyUpdateInterval = setInterval(() => {
    selectivelyConnectToPeers();
  }, 5000);
}

function leaveLobby() {
  console.log("stopping lobby");
  lobby.stop();

  showBroadcast();
  lobbyIsActive = false;
  clearInterval(lobbyUpdateInterval);
  disconnectFromAllPeers();
  document.getElementById("lobby-controls").style.display = "none";
  document.getElementById("lobby-container").style.display = "none";
}

const enterLobbyButton = document.getElementById("enterLobbyButton");

enterLobbyButton.addEventListener(
  "click",
  () => {
    // enterLobbyButton.disabled = true;
    if (lobbyIsActive) {
      leaveLobby();
      enterLobbyButton.innerHTML = "Enter Lobby";
    } else {
      enterLobby();
      enterLobbyButton.innerHTML = "Leave Lobby";
    }
  },
  false
);

const startCameraButton = document.getElementById("startCameraButton");

startCameraButton.addEventListener("click", () => {
  getDevices();
});

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

function selectivelyConnectToPeers() {
  let closestPeers = lobby.getClosestPeers(8);
  // ensure we have all of these peers connected
  for (const id of closestPeers) {
    mediasoupPeer.connectToPeer(id);
  }

  // then pause all other peers:
  for (const id in peers) {
    if (closestPeers.includes(id)) {
      mediasoupPeer.resumePeer(id);
    } else {
      mediasoupPeer.pausePeer(id);
    }
  }
}

function disconnectFromAllPeers() {
  for (const id in peers) {
    mediasoupPeer.pausePeer(id);
  }
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

function showBroadcast() {
  let container = document.getElementById("broadcastVideoContainer");
  let video = document.getElementById("broadcastVideo");
  container.style.display = "";

  document.getElementById("broadcastAudio").volume = 1;

  let height = container.offsetHeight;

  video.style.height = `${height}px`;

  let aspectRatio = 1920/1080;
  let width = height * aspectRatio;

  container.style.width = `${width}px`;
}

function gotTrack(track, id, label) {
  console.log(`Got track of kind ${label} from ${id}`);

  let isBroadcast = label == "video-broadcast" || label == "audio-broadcast";

  let el = document.getElementById(id + "_" + label);

  if (isBroadcast && track.kind === "video") {
    el = document.getElementById("broadcastVideo");
  }
  if (isBroadcast && track.kind === "audio") {
    el = document.getElementById("broadcastAudio");
    el.volume = 1;
  }

  if (track.kind === "video") {
    if (el == null) {
      console.log("Creating video element for client with ID: " + id);
      el = document.createElement("video");
      el.id = id + "_video";
      el.autoplay = true;
      el.muted = true;
      el.setAttribute("playsinline", true);

      el.style = "visibility: hidden;";
      document.body.appendChild(el);
      lobby.addVideoToPeer(id);
    }
  }

  if (track.kind === "audio") {
    if (el == null) {
      console.log("Creating audio element for client with ID: " + id);
      el = document.createElement("audio");
      el.id = id + "_" + label;
      // document.body.appendChild(el);
      el.setAttribute("playsinline", true);
      el.setAttribute("autoplay", true);
      el.volume = 0;

      lobby.addAudioToPeer(id);
    }
  }

  el.srcObject = null;
  el.srcObject = new MediaStream([track]);

  el.onloadedmetadata = (e) => {
    el.play().catch((e) => {
      console.log("Play Error: " + e);
    });
  };
}

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

  const videoTrack = localCam.getVideoTracks()[0];
  const audioTrack = localCam.getAudioTracks()[0];

  let videoStream = new MediaStream([videoTrack]);
  if ("srcObject" in videoElement) {
    videoElement.srcObject = videoStream;
  } else {
    videoElement.src = window.URL.createObjectURL(videoStream);
  }

  videoElement.play();

  mediasoupPeer.addTrack(videoTrack, "video");
  mediasoupPeer.addTrack(audioTrack, "audio");

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
      width: { ideal: 320 },
      height: { ideal: 240 },
    },
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .then(gotDevices)
    .catch(handleError);
}

// function getCamPausedState() {
//     return webcamVideoPaused;
// }

// function getMicPausedState() {
//     return webcamAudioPaused;
// }

// function getScreenPausedState() {
//     return screenShareVideoPaused;
// }

// function getScreenAudioPausedState() {
//     return screenShareAudioPaused;
// }

// async function toggleWebcamVideoPauseState() {
//     if (!localCam) return;
//     if (getCamPausedState()) {
//         // resumeProducer(camVideoProducer);
//         localCam.getVideoTracks()[0].enabled = true;
//     } else {
//         // pauseProducer(camVideoProducer);
//         localCam.getVideoTracks()[0].enabled = false;
//     }
//     webcamVideoPaused = !webcamVideoPaused;
//     toggleWebcamImage();
// }

// async function toggleWebcamAudioPauseState() {
//     if (!localCam) return;
//     if (getMicPausedState()) {
//         // resumeProducer(camAudioProducer);
//         localCam.getAudioTracks()[0].enabled = true;
//     } else {
//         // pauseProducer(camAudioProducer);
//         localCam.getAudioTracks()[0].enabled = false;
//     }
//     webcamAudioPaused = !webcamAudioPaused;
//     toggleMicrophoneImage();
// }
