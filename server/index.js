import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// set debugging level
process.env.DEBUG = "";

// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
require("dotenv").config();

const http = require("http");
const MediasoupManager = require("simple-mediasoup-peer-server");

const express = require("express");
var cors = require("cors");

import morgan from "morgan";

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Stage DB Setup

// for real-time subscriptions
let stageSubscriptions = {};

// for real-time subscriptions
let lobbySubscriptions = {};

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Client Info Setup

let realTimePeerInfo = {};
let clients = {};

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Main

async function main() {
  const app = express();

  app.use(morgan("dev")); // 'dev' outputs concise colored logs to the console
  app.use(
    cors({
      origin: "http://localhost:3000", // Replace with your frontend's origin
      credentials: true, // Allow cookies to be sent
    }),
  );

  const server = http.createServer(app);

  const port = 3030;
  server.listen(port);
  console.log(`Server listening on http://localhost:${port}`);

  let io = require("socket.io")();
  io.listen(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(
      "A client connected and has ID " +
        socket.id +
        ". We npw have " +
        io.engine.clientsCount +
        " clients connected.",
    );

    socket.emit("serverTime", { serverTime: Date.now() });

    socket.emit("clients", Object.keys(clients));
    socket.broadcast.emit("clientConnected", socket.id);

    // then add to our clients object
    clients[socket.id] = { stageId: null, displayName: null }; // store initial client state here
    realTimePeerInfo[socket.id] = { position: {x: -1000, y: -1000, z: -1000}};

    socket.on("joinStage", async (stageId) => {
      console.log("socket", socket.id, "joinging stage", stageId);

      // update our clients object
      clients[socket.id].stageId = stageId;

      // subscribe to updates for given stageId
      if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
      stageSubscriptions[stageId].push(socket);
    });

    socket.on(
      "joinLobby",
      async ({ lobbyId, userId, displayName, displayColor }) => {
        console.log("socket", socket.id, "joinging lobby", lobbyId);

        console.log('realtimepeerInfo:', realTimePeerInfo);
        realTimePeerInfo[socket.id].userId = userId;
        realTimePeerInfo[socket.id].displayName = displayName;
        realTimePeerInfo[socket.id].displayColor = displayColor;

        // update our clients object
        clients[socket.id].lobbyId = lobbyId;

        // subscribe to updates for given lobbyId
        if (!lobbySubscriptions[lobbyId]) lobbySubscriptions[lobbyId] = [];
        lobbySubscriptions[lobbyId].push(socket);
      },
    );

    socket.on("disconnect", () => {
      delete clients[socket.id];
      delete realTimePeerInfo[socket.id];
      io.sockets.emit("clientDisconnected", socket.id);
      console.log("client disconnected: ", socket.id);
    });

    socket.on("mousePosition", (data) => {
      let now = Date.now();
      realTimePeerInfo[socket.id].position = data;
      realTimePeerInfo[socket.id].lastSeenTs = now;
    });

    socket.on("savePeerData", (msg) => {
      realTimePeerInfo[socket.id][msg.type] = msg.data;
    });

    socket.on("relay", (data) => {
      io.sockets.emit("relay", data);
    });
  });

  // update all sockets at regular intervals
  setInterval(() => {
    console.log('realtimepeerInfo:', realTimePeerInfo);
    io.sockets.emit("peerInfo", realTimePeerInfo);
  }, 50);

  // we use serverTime for synced playback needs
  setInterval(() => {
    io.sockets.emit("serverTime", { serverTime: Date.now() });
  }, 500);

  // check for inactive clients and send them into cyberspace
  // setInterval(() => {
  //   let now = Date.now();
  //   for (let id in realTimePeerInfo) {
  //     if (now - realTimePeerInfo[id].lastSeenTs > 5000) {
  //       console.log("Culling inactive user with id", id);
  //       delete realTimePeerInfo[id];
  //     }
  //   }
  // }, 5000);

  new MediasoupManager({ io: io });
}

main();
