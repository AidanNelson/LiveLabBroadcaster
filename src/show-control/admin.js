import { io } from "socket.io-client";

let socket;
let sceneId = 0;
let numScenes = 6;

let sceneSwitcherButtons = {};

function setup() {
  console.log("Setting up socket connection");

  socket = io(process.env.SERVER_URL, {
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
}

setup();
