const { Client, Server } = require("node-osc");
const { io } = require("socket.io-client");

let socket;
const ls = localStorage;

async function main() {
  console.log("~~~~~~~~~~~~~~~~~");

  let oscIP = ls.getItem("oscip");
  if (oscIP) document.getElementById("osc-server-input").value = oscIP;
  let oscPort = ls.getItem("oscport");
  if (oscIP) document.getElementById("osc-server-port-input").value = oscPort;
  let socketip = ls.getItem("socketip");
  if (socketip) document.getElementById("socket-server-input").value = socketip;

  document.getElementById("connect").addEventListener("click", (ev) => {
    ev.preventDefault();

    const oscServerIP = document.getElementById("osc-server-input").value;
    const oscServerPort = document.getElementById(
      "osc-server-port-input"
    ).value;
    ls.setItem("oscip", oscServerIP);
    ls.setItem("oscport", oscServerPort);
    const client = new Client(oscServerIP, oscServerPort);
    console.log("connecting to socket server");
    const serverURL = document.getElementById("socket-server-input").value;
    ls.setItem("socketip", serverURL);
    console.log(io);
    socket = io(serverURL, {
      path: "/socket.io",
    });
    socket.on("connect", () => {
      console.log("Socket ID: ", socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on("osc", (message) => {
      console.log("Received socket message:", message);
      console.log("Sending osc:", message);
      client.send(message);
    });

    // socket.on("oscForSockets", (message) => {s
    //   console.log("Received socket message:", message);
    //   console.log("Sending osc:", message);
    //   client.send(message, 200, () => {});
    // });

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
