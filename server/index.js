import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// set debugging level
process.env.DEBUG = "";

// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
require("dotenv").config();

const http = require("http");
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
  if (!stageSubscriptions[stageId]) {
    stageSubscriptions[stageId] = [];
  }
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
  if (stageSubscriptions[stageId]) {
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
};

const getSocketOrNullsInStageSubscriptions = (stageId) => {
  // tell other clients about this new client
  let socketOrNulls = [];
  if (stageSubscriptions[stageId]) {
    stageSubscriptions[stageId].forEach((socketOrNull) => {
      if (socketOrNull) {
        socketOrNulls.push(socketOrNull.id);
      } else {
        socketOrNulls.push(null); // keep nulls to maintain order
      }
    });
  }

  return socketOrNulls;
};

const getCurrentNumberOfSocketsInStageSubscriptions = (stageId) => {
  let count = 0;
  if (!stageSubscriptions[stageId]) return count;
  stageSubscriptions[stageId].forEach((socketOrNull) => {
    if (socketOrNull) {
      count++;
    }
  });
  return count;
};

const updateStageSubscribersAboutAudience = (stageId) => {
  if (!stageSubscriptions[stageId]) {
    console.log("No subscriptions found for stage", stageId);
    return;
  }

  for (let socketOrNull of stageSubscriptions[stageId]) {
    if (socketOrNull) {
      socketOrNull.emit(
        "currentAudience",
        getSocketOrNullsInStageSubscriptions(stageId),
      );
    }
  }
};

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Client Info Setup

let clients = {};
let audienceCounts = {};

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

    socket.on("emote", (data) => {
      console.log("Received emote data:", data);
      const stageId = clients[socket.id]?.stageId;
      if (stageId && stageSubscriptions[stageId]) {
        stageSubscriptions[stageId].forEach((socketOrNull) => {
          if (socketOrNull) {
            socketOrNull.emit("emote", data);
          }
        });
      }
    });

    socket.emit("serverTime", { serverTime: Date.now() });

    // then add to our clients object
    clients[socket.id] = { stageId: null, displayName: null }; // store initial client state here

    socket.on("joinStage", async (stageId) => {
      // update our clients object
      clients[socket.id].stageId = stageId;
      socket.join(stageId);

      // subscribe to updates for given stageId
      if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
      insertSocketIntoStageSubscriptions(socket, stageId);
      updateStageSubscribersAboutAudience(stageId);

      console.log(
        "StageId:",
        stageId,
        "| Time: ",
        new Date().toISOString(),
        "| Socket Count:",
        getCurrentNumberOfSocketsInStageSubscriptions(stageId),
      );
    });

    socket.on("getCurrentAudience", () => {
      const stageId = clients[socket.id]?.stageId;
      if (stageSubscriptions[stageId]) {
        socket.emit(
          "currentAudience",
          getSocketOrNullsInStageSubscriptions(stageId),
        );
      } else {
        socket.emit("currentAudience", []);
      }
    });

    socket.on("leaveStage", (stageId) => {
      removeSocketFromStageSubscriptions(socket, stageId);
      // update our clients object
      clients[socket.id].stageId = null;
      socket.leave(stageId);
      // remove from stage subscriptions
      updateStageSubscribersAboutAudience(stageId);

      console.log(
        "StageId:",
        stageId,
        "| Time: ",
        new Date().toISOString(),
        "| Socket Count:",
        getCurrentNumberOfSocketsInStageSubscriptions(stageId),
      );
    });

    socket.on("pulse", (spaceId) => {
      audienceCounts[spaceId] = audienceCounts[spaceId] || {};
      audienceCounts[spaceId][socket.id] = Date.now();
    });

    socket.on("disconnect", () => {
      const stageId = clients[socket.id]?.stageId;
      if (stageId) {
        removeSocketFromStageSubscriptions(socket, stageId);
        updateStageSubscribersAboutAudience(stageId);

        console.log(
          "StageId:",
          stageId,
          "| Time: ",
          new Date().toISOString(),
          "| Socket Count:",
          getCurrentNumberOfSocketsInStageSubscriptions(stageId),
        );
      }
      delete clients[socket.id];
    });

    socket.on("getCounts", (stageId) => {
      const countData = {
        stage: audienceCounts[stageId]
          ? Object.keys(audienceCounts[stageId]).length
          : 0,
      };
      console.log("Emitting counts:", countData);
      socket.emit("counts", countData);
    });

    socket.on("relay", (data) => {
      const stageId = clients[socket.id]?.stageId;
      if (!stageId) return;
      socket.to(stageId).emit("relay", data);
    });
  });

  // we use serverTime for synced playback needs
  setInterval(() => {
    io.sockets.emit("serverTime", { serverTime: Date.now() });
  }, 500);

  setInterval(() => {
    // clear old audience from count
    const now = Date.now();
    for (const spaceId in audienceCounts) {
      if (audienceCounts[spaceId]) {
        for (const socketId in audienceCounts[spaceId]) {
          if (now - audienceCounts[spaceId][socketId] > 5000) {
            delete audienceCounts[spaceId][socketId];
          }
        }
      }
    }
  }, 5000);

}

main();
