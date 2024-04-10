// set debugging level
process.env.DEBUG = "";

// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
require("dotenv").config();
const express = require("express");
const http = require("http");
const { getStageInfo, watchStageChanges } = require("./db");
const Datastore = require("nedb");
const MediasoupManager = require("simple-mediasoup-peer-server");

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// DB and Chat Setup
const db = {};
db.chat = new Datastore({ filename: "chat.db", autoload: true });
db.displayNamesForChat = new Datastore({
  filename: "displayNames.db",
  autoload: true,
});
db.auctionData = new Datastore({
  filename: "auctionData.db",
  autoload: "true",
});

function updateChatForStageId(stageId) {
  if (stageId === null) return;
  console.log("updating chat for stage", stageId);

  const displayNames = {};
  db.displayNamesForChat.find({}, function (err, docs) {
    if (err) {
      console.log("Error getting display names for chat", err);
    }
    for (const doc of docs) {
      displayNames[doc.socketId] = doc.displayName;
    }
  });
  db.chat.find({ stageId: stageId }, function (err, docs) {
    if (err) {
      console.log("Error getting chat messages", err);
    }
    for (const socket of stageSubscriptions[stageId]) {
      socket.emit("chat", { chats: docs, displayNamesForChat: displayNames });
    }
  });
}

function clearChatForStageId(stageId) {
  if (stageId === null) return;
  console.log("Clearing chat for stage", stageId);
  db.chat.remove({ stageId: stageId }, function (err, numRemoved) {
    if (err) {
      console.log("Error getting chat messages", err);
    } else {
      console.log("Removed ", numRemoved, "chat messages.");
    }
  });
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Stage DB Setup

// for real-time mongodb subscriptions
let stageSubscriptions = {};

watchStageChanges((change) => {
  const doc = change.fullDocument;
  if (!doc || !doc?.stageId || !stageSubscriptions[doc.stageId]) return;
  for (const socket of stageSubscriptions[doc.stageId]) {
    socket.emit("stageInfo", doc);
  }
});

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Client Info Setup

let realTimePeerInfo = {};
let clients = {};

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Main

async function main() {
  const app = express();

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

    socket.emit("clients", Object.keys(clients));
    socket.broadcast.emit("clientConnected", socket.id);

    // then add to our clients object
    clients[socket.id] = { stageId: null, displayName: null }; // store initial client state here

    socket.on("joinStage", async (stageId) => {
      console.log("socket", socket.id, "joinging stage", stageId);

      clients[socket.id].stageId = stageId;
      if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
      stageSubscriptions[stageId].push(socket);

      const stageInfo = await getStageInfo({ stageId });
      // TODO check for stageInfo having length?
      socket.emit("stageInfo", stageInfo);

      const displayNames = {};
      db.displayNamesForChat.find({}, function (err, docs) {
        if (err) {
          console.log("Error getting display names for chat", err);
        }
        for (const doc of docs) {
          displayNames[doc.socketId] = doc.displayName;
        }
      });

      db.chat.find({ stageId: stageId }, function (err, docs) {
        if (err) {
          console.log("Error getting chat messages", err);
        }
        socket.emit("chat", { chats: docs, displayNamesForChat: displayNames });
      });
    });

    socket.on("disconnect", () => {
      delete clients[socket.id];
      delete realTimePeerInfo[socket.id];
      io.sockets.emit("clientDisconnected", socket.id);
      console.log("client disconnected: ", socket.id);
    });

    socket.on("mousePosition", (data) => {
      let now = Date.now();
      if (!realTimePeerInfo[socket.id]) {
        realTimePeerInfo[socket.id] = {};
      }

      realTimePeerInfo[socket.id].position = data;
      realTimePeerInfo[socket.id].lastSeenTs = now;
    });

    socket.on("savePeerData", (msg) => {
      if (!realTimePeerInfo[socket.id]) {
        realTimePeerInfo[socket.id] = {};
      }

      realTimePeerInfo[socket.id][msg.type] = msg.data;
    });

    socket.on("relay", (data) => {
      io.sockets.emit("relay", data);
    });

    socket.on("chat", (msg) => {
      const chatMessage = {
        message: msg,
        from: socket.id,
        stageId: clients[socket.id].stageId,
        timestamp: Date.now(),
      };
      db.chat.insert(chatMessage, (err) => {
        if (err) {
          console.log("Error inserting chat message", err);
        }
      });
      updateChatForStageId(clients[socket.id].stageId);
    });

    socket.on("clearChat", () => {
      if (clients[socket.id].stageId) {
        clearChatForStageId(clients[socket.id].stageId);
      }
    });

    socket.on("setDisplayNameForChat", (displayName) => {
      db.displayNamesForChat.insert(
        { socketId: socket.id, displayName },
        (err) => {
          if (err) {
            console.log("Error inserting display name", err);
          }
          updateChatForStageId(clients[socket.id].stageId);
        },
      );
      // displayNamesForChat[socket.id] = displayName;
    });

    socket.on("saveAuctionData", ({ name, email, paddleNumber, info }) => {
      db.auctionData.insert({
        socketId: socket.id,
        name: name,
        paddleNumber: paddleNumber,
        email: email,
        info: info,
        timestamp: Date.now(),
      });
    });

    socket.on("getAuctionData", () => {
      db.auctionData.find({}, function (err, docs) {
        if (err) {
          console.log("Error getting display names for chat", err);
        }
        socket.emit("auctionData", docs);
      });
    });
  });

  // update all sockets at regular intervals
  setInterval(() => {
    io.sockets.emit("peerInfo", realTimePeerInfo);
  }, 50);

  // every X seconds, check for inactive clients and send them into cyberspace
  setInterval(() => {
    let now = Date.now();
    for (let id in realTimePeerInfo) {
      if (now - realTimePeerInfo[id].lastSeenTs > 5000) {
        console.log("Culling inactive user with id", id);
        delete realTimePeerInfo[id];
      }
    }
  }, 5000);

  new MediasoupManager({ io: io });
}

main();
