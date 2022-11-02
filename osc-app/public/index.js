// import { io } from "socket.io-client";
// import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";
const { Client } = require("node-osc");

const client = new Client("127.0.0.1", 53000);

let socket;

async function main() {
  console.log("~~~~~~~~~~~~~~~~~");

  document.getElementById("connect").addEventListener("click", (ev) => {
    ev.preventDefault();
    console.log("connecting to socket server");
    const serverURL = document.getElementById("socket-server-input").value;
    socket = io(serverURL, {
      path: "/socket.io",
    });
    socket.on("connect", () => {
      console.log("Socket ID: ", socket.id); // x8WIv7-mJelg7on_ALbx
    });
    socket.on("osc", (message) => {
      console.log("Got message for OSC:", message);
      console.log("sending osc:", message);
      client.send(message, 200, () => {});
    });
  });

  // socket = io("https://afewdeepbreaths.livelab.app", {
  //   path: "/socket.io",
  // });
}

main();
