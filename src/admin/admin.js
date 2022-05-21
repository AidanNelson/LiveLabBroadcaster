import { io } from "socket.io-client";
// import { SimpleMediasoupPeer  } from "../libs/SimpleMediasoupPeer";

let url = "https://afewdeepbreaths.livelab.app";

let socket;
let sceneId = 0;
let numScenes = 6;

let videoEffectActive = true;

let sceneSwitcherButtons = {};

function setup() {
  console.log("Setting up socket connection");

  socket = io(url, {
    path: "/socket.io",
  });

  socket.on("connect", function () {
    console.log("Connected");
  });



  document.getElementById("clearChat").addEventListener("click", () => {
    socket.emit("clearChat");
  });

  document.getElementById("sendAdminMessage").addEventListener("click", () => {
    let message = document.getElementById("adminMessageInput").value;
    console.log("sending admin message:", message);
    let data = {
      msg: message,
    };
    socket.emit("adminMessage", data);
  });

  socket.on("sceneIdx", (data) => {
    sceneId = data;
    console.log("Current scene from server: ", data);

    for (let id in sceneSwitcherButtons) {
      sceneSwitcherButtons[id].classList.remove("activeButton");
    }
    if (sceneSwitcherButtons[data]) {
      sceneSwitcherButtons[data].classList.add("activeButton");
    }
  });

  // let sceneSwitcherButtonContainer = document.getElementById(
  //   "sceneSwitcherButtonContainer"
  // );

  let lobbyButton = document.getElementById("activateLobbyButton");
  lobbyButton.addEventListener("click", () => {
    socket.emit("sceneIdx", 1);
  });
  sceneSwitcherButtons[1] = lobbyButton;

  let showButton = document.getElementById("activateShowButton");
  showButton.addEventListener("click", () => {
    socket.emit("sceneIdx", 2);
  });
  sceneSwitcherButtons[2] = showButton;

  let showChatButton = document.getElementById("showChatButton");
  showChatButton.addEventListener("click", () => {
    socket.emit("showChat", true);
  });
  let hideChatButton = document.getElementById("hideChatButton");
  hideChatButton.addEventListener("click", () => {
    socket.emit("showChat", false);
  });

  let toggleVideoEffectButton = document.getElementById(
    "toggleVideoEffectButton"
  );
  toggleVideoEffectButton.addEventListener("click", () => {
    socket.emit('videoEffect', !videoEffectActive);
  });
  socket.on("videoEffect", (data) => {
    videoEffectActive = data;
    if (videoEffectActive){
      toggleVideoEffectButton.classList.add('activeButton');
    } else {
      toggleVideoEffectButton.classList.remove('activeButton');
    }
  });

  // for (let i = 1; i <= numScenes; i++) {
  //   let b = document.createElement("button");
  //   b.innerHTML = "Scene " + i;

  //   b.onclick = () => {
  //     console.log("Switching to scene " + i);
  //     socket.emit("sceneIdx", i);
  //   };

  //   sceneSwitcherButtonContainer.appendChild(b);
  //   sceneSwitcherButtons[i] = b;
  // }
  console.log(sceneSwitcherButtons);
}

setup();
