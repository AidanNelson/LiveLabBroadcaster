// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
require("dotenv").config();
const express = require("express");
const http = require("http");
const Datastore = require("nedb");
const db = {};
db.chat = new Datastore({ filename: "chat.db", autoload: true });
db.displayNamesForChat = new Datastore({filename: "displayNames.db", autoload: true});
console.log((process.env.DEBUG = "SimpleMediasoupPeer*"));
const MediasoupManager = require("simple-mediasoup-peer-server");

// for real-time mongodb subscriptions
let stageSubscriptions = {};

const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require("fs");

const keyFile = fs.readFileSync("./db-key.pem");
const certFile = fs.readFileSync("./db-cert.pem");

const mongoClient = new MongoClient(process.env.MONGODB_URL, {
  key: keyFile,
  cert: certFile,
  serverApi: ServerApiVersion.v1,
});

const database = mongoClient.db("virtual-venue-db");
const stagesCollection = database.collection("stages");
const stagesChangeStream = stagesCollection.watch("/");
stagesChangeStream.on("change", (change) => {
  const doc = change.fullDocument;
  if (!doc || !doc?.stageId || !stageSubscriptions[doc.stageId]) return;
  for (const socket of stageSubscriptions[doc.stageId]) {
    socket.emit("stageInfo", doc);
  }
});

let realTimePeerInfo = {};

let clients = {};
let adminMessage = "";
let sceneId = 1; // start at no scene
let shouldShowChat = false;

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

      await mongoClient.connect();
      const database = mongoClient.db("virtual-venue-db");
      const collection = database.collection("stages");
      const stage = await collection.findOne({ stageId });
      socket.emit("stageInfo", stage);

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

      // from client side
      // socket.emit('savePeerData', {
      //   type: 'flagStatus',
      //   data: true
      // })

      // {'asidufgaasifubasidu12iu312i' {position: [0.2, 0.3], 'flagStatus': true, 'flagPosition': [0.2, 0.3]}}
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

    socket.on("setDisplayNameForChat", (displayName) => {
      db.displayNamesForChat.insert({ socketId: socket.id, displayName }, (err) => {if (err) {
        console.log("Error inserting display name", err);
      }
      updateChatForStageId(clients[socket.id].stageId);
    });
      // displayNamesForChat[socket.id] = displayName;
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
