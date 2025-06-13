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

// these 'stage subscriptions' are maintained in a slightly odd way, 
// because we want to maintain a consistent ordering of sockets,
// so that each client sees the same order of audience members
// so when an audience member leaves, we mark their slot in the 
// array as null, and reuse it when a new audience member joins

// for real-time subscriptions
let stageSubscriptions = {};

const insertSocketIntoStageSubscriptions = (socket, stageId) => {
  for (let i = 0; i < stageSubscriptions[stageId].length; i++) {
    if (stageSubscriptions[stageId][i] === null) {
      stageSubscriptions[stageId][i] = socket;
      return;
    }
  }
  // if we reach here, we need to expand the array
  stageSubscriptions[stageId].push(socket);
};

const removeSocketFromStageSubscriptions = (socket, stageId) => {
  if (stageSubscriptions[stageId]) {
    const index = stageSubscriptions[stageId].findIndex(
      (socketOrNull) => socketOrNull && socketOrNull.id === socket.id,
    );
    if (index !== -1) {
      stageSubscriptions[stageId][index] = null; // mark as null to reuse later
    } else {
      console.log("No subscriptions found for stage", stageId);
    }
  }

  let hasAudience = false;
  for (let socketOrNull of stageSubscriptions[stageId]) {
    if (socketOrNull) {
      hasAudience = true;
      break;
    }
  }
  if (!hasAudience) {
    delete stageSubscriptions[stageId]; // remove the stage subscription if no audience left
  }

}

const getSocketOrNullsInStageSubscriptions = (stageId) => {
  // tell other clients about this new client
  let socketOrNulls = [];
  stageSubscriptions[stageId].forEach((socketOrNull) => {
    if (socketOrNull) {
      socketOrNulls.push(socketOrNull.id);
    } else {
      socketOrNulls.push(null); // keep nulls to maintain order
    }
  });

  return socketOrNulls;
}

const getCurrentNumberOfSocketsInStageSubscriptions = (stageId) => {
  let count = 0;
  if (!stageSubscriptions[stageId]) return count;
  stageSubscriptions[stageId].forEach((socketOrNull) => {
    if (socketOrNull) {
      count++;
    }
  })
  return count;
}

const updateStageSubscribersAboutAudience = (stageId) => {
  if (!stageSubscriptions[stageId]) {
    console.log("No subscriptions found for stage", stageId);
    return;
  }

  for (let socketOrNull of stageSubscriptions[stageId]) {
    if (socketOrNull) {
      socketOrNull.emit("currentAudience", getSocketOrNullsInStageSubscriptions(stageId));
    }
  }
}

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
    // console.log("Socket Count: ", io.engine.clientsCount);

    socket.on('emote', (data) => {
      console.log("Received emote data:", data);
      const stageId = clients[socket.id]?.stageId;
      if (stageId && stageSubscriptions[stageId]) {
        stageSubscriptions[stageId].forEach((socketOrNull) => {
          if (socketOrNull) {
            socketOrNull.emit("emote", data);
          }
        });
      }
    })

    socket.emit("serverTime", { serverTime: Date.now() });

    socket.emit("clients", Object.keys(clients));
    socket.broadcast.emit("clientConnected", socket.id);

    // then add to our clients object
    clients[socket.id] = { stageId: null, displayName: null }; // store initial client state here
    realTimePeerInfo[socket.id] = {
      position: { x: -1000, y: -1000, z: -1000 },
    };

    socket.on("joinStage", async (stageId) => {

      // update our clients object
      clients[socket.id].stageId = stageId;

      // subscribe to updates for given stageId
      if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
      insertSocketIntoStageSubscriptions(socket, stageId);
      updateStageSubscribersAboutAudience(stageId);

        console.log("StageId:", stageId, "| Time: ", new Date().toISOString(), "| Socket Count:", getCurrentNumberOfSocketsInStageSubscriptions(stageId));

    });

    socket.on('getCurrentAudience', () => {
      const stageId = clients[socket.id]?.stageId;
      if (stageSubscriptions[stageId]) {
        socket.emit("currentAudience", getSocketOrNullsInStageSubscriptions(stageId));
      } else {
        socket.emit("currentAudience", []);
      }
    });

    socket.on("leaveStage", (stageId) => {
      removeSocketFromStageSubscriptions(socket, stageId);
      // update our clients object
      clients[socket.id].stageId = null;
      // remove from stage subscriptions
      updateStageSubscribersAboutAudience(stageId);

        console.log("StageId:", stageId, "| Time: ", new Date().toISOString(), "| Socket Count:", getCurrentNumberOfSocketsInStageSubscriptions(stageId));

    });

    socket.on(
      "joinLobby",
      async ({ lobbyId, userId, displayName, displayColor }) => {

        realTimePeerInfo[socket.id].userId = userId;
        realTimePeerInfo[socket.id].displayName = displayName;
        realTimePeerInfo[socket.id].displayColor = displayColor;

        // update our clients object
        clients[socket.id].lobbyId = lobbyId;
      },
    );

    socket.on("leaveLobby", (lobbyId) => {
      // update our clients object
      clients[socket.id].lobbyId = null;
    });

    socket.on("disconnect", () => {
      const stageId = clients[socket.id]?.stageId;
      if (stageId) {
        removeSocketFromStageSubscriptions(socket, stageId);
        updateStageSubscribersAboutAudience(stageId);

        console.log("StageId:", stageId, "| Time: ", new Date().toISOString(), "| Socket Count:", getCurrentNumberOfSocketsInStageSubscriptions(stageId));

      }
      delete clients[socket.id];
      delete realTimePeerInfo[socket.id];
      io.sockets.emit("clientDisconnected", socket.id);
      // console.log("Socket Count: ", io.engine.clientsCount);

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
