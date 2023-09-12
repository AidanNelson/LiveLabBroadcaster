/*
Virtual Venue
Aidan Nelson, July 2022
*/

import { io } from "socket.io-client";
import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";

import { Lobby } from "./lobby";

let socket;
let mediasoupPeer;
let localCam;

let cameraPaused = false;
let micPaused = false;

let lobby;
let lobbyUpdateInterval;
let hasCompletedOnboarding = false;
let hasInitializedCameraAccess = false;
let broadcastIsActive = false;

let videoIsTransformed = false;

let peers = {};

let currentSceneId = 0;

const cameraPausedButton = document.getElementById("toggleCameraPausedButton");
const microphonePausedButton = document.getElementById(
  "toggleMicrophonePausedButton"
);

window.onload = () => {
  document
    .getElementById("onboardingEnterButton")
    .addEventListener("click", () => {
      // this should remove onboarding container, and add participant to the show OR the lobby depending on the current state of things
      hasCompletedOnboarding = true;
      document.getElementById("onboarding-container").style.display = "none";
      document.getElementById("main-content-container").style.display = "";

      init();
      console.log("Onboarding complete!");
    });

  window.addEventListener(
    "resize",
    function (event) {
      // respond to resize:
      resizeBroadcast();
    },
    true
  );
};

function init() {
  console.log("~~~~~~~~~~~~~~~~~");

  // hack to prevent issue where we've been scrolled below content...
  window.scrollTo(0, 0);

  socket = io(process.env.SERVER_URL, {
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
    currentSceneId = sceneId;
    updateCurrentScene();
  });

  socket.on("adminMessage", (data) => {
    document.getElementById("adminMessageText").innerHTML = data.msg;
  });

  socket.on("chat", (data) => {
    let text = "";
    let messages = data.data;
    let container = document.getElementById("chatBox");
    for (let i = messages.length - 1; i >= 0; i--) {
      let msg = messages[i].msg;
      console.log(msg);
      text += msg + "\n\n";
    }
    container.innerText = text;

    let cc = document.getElementById("chatContainer");
    cc.scrollTop = cc.scrollHeight;
  });

  socket.on("showChat", (data) => {
    let container = document.getElementById("chat-column");
    let mainContainer = document.getElementById("main-content-box");
    if (data) {
      container.style.display = "";
      mainContainer.classList.remove("col-12");
      mainContainer.classList.add("col-10");
    } else {
      container.style.display = "none";
      mainContainer.classList.remove("col-10");
      mainContainer.classList.add("col-12");
    }
  });

  let chatInput = document.getElementById("chatMessageInput");
  document.getElementById("sendChatButton").addEventListener("click", () => {
    sendChatMessage();
  });
  chatInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      sendChatMessage();
    }
  });

  document.addEventListener("keydown", showLeftVideo);
  document.addEventListener("keyup", showRightVideo);

  cameraPausedButton.addEventListener("click", () => {
    if (cameraPaused) {
      resumeVideo();
    } else {
      pauseVideo();
    }
  });

  microphonePausedButton.addEventListener("click", () => {
    if (micPaused) {
      resumeMic();
    } else {
      pauseMic();
    }
  });

  mediasoupPeer = new SimpleMediasoupPeer(socket);
  mediasoupPeer.on("track", gotTrack);

  updateCurrentScene();
}

function updateCameraPausedButton() {
  if (cameraPaused) {
    cameraPausedButton.innerText = "CAMERA OFF";
    cameraPausedButton.classList.remove("buttonActive");
    cameraPausedButton.classList.add("buttonInactive");
  } else {
    cameraPausedButton.innerText = "CAMERA ON";
    cameraPausedButton.classList.remove("buttonInactive");
    cameraPausedButton.classList.add("buttonActive");
  }
}

function updateMicPausedButton() {
  if (micPaused) {
    microphonePausedButton.innerText = "MIC OFF";
    microphonePausedButton.classList.remove("buttonActive");
    microphonePausedButton.classList.add("buttonInactive");
  } else {
    microphonePausedButton.innerText = "MIC ON";
    microphonePausedButton.classList.remove("buttonInactive");
    microphonePausedButton.classList.add("buttonActive");
  }
}

function sendChatMessage() {
  let input = document.getElementById("chatMessageInput");
  let message = input.value;
  console.log("sending chat message:", message);
  let data = {
    msg: message,
  };
  socket.emit("chat", data);
  input.value = "";
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

function updateCurrentScene() {
  if (!hasCompletedOnboarding) return;

  console.log("Switching to scene: ", currentSceneId);
  if (currentSceneId === 1) {
    // lobby
    activateLobby();
    deactivateBroadcast();
    // activateBroadcast();
  } else if (currentSceneId === 2) {
    // show
    deactivateLobby();
    activateBroadcast();
  }
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

const showLeftVideo = (ev) => {
  let videoEl = document.getElementById("broadcastVideo");
  if (ev.key == " " && !videoIsTransformed) {
    console.log("left");
    videoEl.style.transform = "translateX(50%) scaleX(2)";
    videoIsTransformed = true;
  }
};

const showRightVideo = (ev) => {
  let videoEl = document.getElementById("broadcastVideo");
  if (ev.key == " " && videoIsTransformed) {
    console.log("right");
    videoEl.style.transform = "translateX(-50%) scaleX(2)";
    videoIsTransformed = false;
  }
};

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

async function initializeCameraAccess() {
  hasInitializedCameraAccess = true;
  // request user media before getting device list or the browser may not prompt user for access
  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  getDevices();
}

function activateLobby() {
  console.log("Entering lobby!");

  // show the lobby HTML
  document.getElementById("lobby-controls").style.display = "";
  document.getElementById("lobby-container").style.display = "";

  setTimeout(() => {
    lobby.start();

    if (!hasInitializedCameraAccess) {
      initializeCameraAccess();
    }

    lobbyUpdateInterval = setInterval(() => {
      selectivelyConnectToPeers();
    }, 2000);
  }, 1000);
}

function deactivateLobby() {
  console.log("Leaving lobby!");

  document.getElementById("lobby-controls").style.display = "none";
  document.getElementById("lobby-container").style.display = "none";

  lobby.stop();

  clearInterval(lobbyUpdateInterval);
  disconnectFromAllPeers(); // disconnect from all lobby peers

  pauseMic();
  pauseVideo();
}

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

function activateBroadcast() {
  if (broadcastIsActive) return;
  broadcastIsActive = true;

  let container = document.getElementById("broadcastVideoContainer");
  container.style.display = "";

  // also turn audio on
  // document.getElementById("broadcastAudio").volume = 1;
}

function resizeBroadcast() {
  let mainContentContainer = document.getElementById("main-content-box");
  let container = document.getElementById("broadcastVideoContainer");

  let availableWidth = mainContentContainer.offsetWidth;
  let availableHeight = mainContentContainer.offsetHeight;

  let aspect = 1920 / 1080;
  let reverseAspect = 1080 / 1920;

  let availableAspect = availableWidth / availableHeight;

  console.log("aspect:", aspect, "/ availableAspect:", availableAspect);

  // if we are wider than 16:9 aspect ratio
  if (availableAspect >= aspect) {
    // wider than needed
    container.style.height = `${availableHeight}px`;

    let w = availableHeight * aspect;
    container.style.width = `${w}px`;
  } else {
    // taller than needed:
    container.style.width = `${availableWidth}px`;
    let h = availableWidth * reverseAspect;
    container.style.height = `${h}px`;
  }
}

function deactivateBroadcast() {
  let container = document.getElementById("broadcastVideoContainer");
  container.style.display = "none";

  // document.getElementById("broadcastAudio").volume = 0;
  broadcastIsActive = false;
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

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
      document.body.appendChild(el);
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

  cameraPaused = false;
  micPaused = false;
  updateCameraPausedButton();
  updateMicPausedButton();

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

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

function pauseVideo() {
  if (!localCam) return;
  localCam.getVideoTracks()[0].enabled = false;
  cameraPaused = true;

  updateCameraPausedButton();
}

function resumeVideo() {
  if (!localCam) return;
  localCam.getVideoTracks()[0].enabled = true;
  cameraPaused = false;

  updateCameraPausedButton();
}

function pauseMic() {
  if (!localCam) return;
  localCam.getAudioTracks()[0].enabled = false;
  micPaused = true;

  updateMicPausedButton();
}

function resumeMic() {
  if (!localCam) return;
  localCam.getAudioTracks()[0].enabled = true;
  micPaused = false;

  updateMicPausedButton();
}
