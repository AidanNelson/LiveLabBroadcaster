import { io } from "socket.io-client";
// import { SimpleMediasoupPeer  } from "../libs/SimpleMediasoupPeer";

let url = "localhost:5000";
let socket;
let sceneId = 0;
let numScenes = 6;

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

  socket.on("sceneIdx", (data) => {
    sceneId = data;
    console.log(data);

    for (let id in sceneSwitcherButtons) {
      sceneSwitcherButtons[id].classList.remove("activeButton");
    }
    if (sceneSwitcherButtons[data]) {
      sceneSwitcherButtons[data].classList.add("activeButton");
    }
  });

  let sceneSwitcherButtonContainer = document.getElementById(
    "sceneSwitcherButtonContainer"
  );
  for (let i = 1; i <= numScenes; i++) {
    let b = document.createElement("button");
    b.innerHTML = "Scene " + i;

    b.onclick = () => {
      console.log("Switching to scene " + i);
      socket.emit("sceneIdx", i);
    };

    sceneSwitcherButtonContainer.appendChild(b);
    sceneSwitcherButtons[i] = b;
  }
  console.log(sceneSwitcherButtons);

  // let scene01Button = document.getElementById('scene01');
  // let scene02Button = document.getElementById('scene02');
  // let scene03Button = document.getElementById('scene03');
  // let scene04Button = document.getElementById('scene04');
  // let scene05Button = document.getElementById('scene05');
  // let scene06Button = document.getElementById('scene06');

  // scene01Button.onclick = () => {
  //     console.log('Switching to scene 01');
  //     socket.emit('sceneIdx', 1);
  // }

  // scene02Button.onclick = () => {
  //     console.log('Switching to scene 02');
  //     socket.emit('sceneIdx', 2);
  // }
  // scene03Button.onclick = () => {
  //     console.log('Switching to scene 03');
  //     socket.emit('sceneIdx', 3);
  // }
  // scene04Button.onclick = () => {
  //     console.log('Switching to scene 04');
  //     socket.emit('sceneIdx', 4);
  // }
  // scene05Button.onclick = () => {
  //     console.log('Switching to scene 05');
  //     socket.emit('sceneIdx', 5);
  // }
  // scene06Button.onclick = () => {
  //     console.log('Switching to scene 06');
  //     socket.emit('sceneIdx', 6);
  // }
}

setup();
