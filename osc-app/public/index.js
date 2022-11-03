// import { io } from "socket.io-client";
// import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";
const { Client, Server } = require("node-osc");

let socket;

async function main() {
  console.log("~~~~~~~~~~~~~~~~~");

  document.getElementById("connect").addEventListener("click", (ev) => {
    ev.preventDefault();

    const oscServerIP = document.getElementById("osc-server-input").value;
    const oscServerPort = document.getElementById(
      "osc-server-port-input"
    ).value;
    const client = new Client(oscServerIP, oscServerPort);
    console.log("connecting to socket server");
    const serverURL = document.getElementById("socket-server-input").value;
    socket = io(serverURL, {
      path: "/socket.io",
    });
    socket.on("connect", () => {
      console.log("Socket ID: ", socket.id); // x8WIv7-mJelg7on_ALbx
    });
    socket.on("oscForSockets", (message) => {
      console.log("Received socket message:", message);
      console.log("Sending osc:", message);
      client.send(message, 200, () => {});
    });

    var oscServer = new Server(3333, "127.0.0.1");

    oscServer.on("message", function (msg) {
      console.log(`Received OSC message: ${msg}`);
      console.log(`Sending socket message: ${msg}`);
      socket.emit("oscForSockets", msg);
    });
  });

  // socket = io("https://afewdeepbreaths.livelab.app", {
  //   path: "/socket.io",
  // });
}

main();
