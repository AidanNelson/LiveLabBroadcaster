// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
const express = require("express");
const https = require("https");
const http = require("http");
const Datastore = require("nedb");
const MediasoupManager = require("simple-mediasoup-peer-server");
const { deleteAppClientCache } = require("next/dist/server/lib/render-server");

let clients = {};
let adminMessage = "";
let sceneId = 1; // start at no scene
let shouldShowChat = false;

function createDefaultVenueDoc(venueId) {
  return {
    venueId: venueId,
    cues: [],
    features: [],
  };
}

async function main() {
  const app = express();

  const server = http.createServer(app);

  const port = 3030;
  server.listen(port);
  console.log(`Server listening on http://localhost:${port}`);

  let db = new Datastore({
    filename: "info.db",
    timestampData: true,
  }); //creates a new one if needed
  db.loadDatabase(); //loads the db with the data

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

    // send chat
    db.find({})
      .sort({ createdAt: -1 })
      .exec(function (err, docs) {
        dataToSend = { data: docs };
        socket.emit("chat", dataToSend);
      });

    // db.find({ type: "script" })
    //   .sort({ createdAt: -1 })
    //   .exec(function (err, docs) {
    //     const dataToSend = { data: docs };
    //     console.log("sending existing scripts:", dataToSend);
    //     socket.emit("script", dataToSend);
    //   });

    socket.emit("clients", Object.keys(clients));
    socket.emit("sceneIdx", sceneId);
    socket.emit("adminMessage", adminMessage);
    socket.emit("showChat", shouldShowChat);

    socket.broadcast.emit("clientConnected", socket.id);

    // then add to our clients object
    clients[socket.id] = {}; // store initial client state here

    socket.on("getVenueInfo", (venueId, callback) => {
      console.log("getting info for venue: ", venueId);
      // The same rules apply when you want to only find one document
      db.findOne({ venueId: venueId }, (err, doc) => {
        let venueInfo = null;
        if (!doc) {
          venueInfo = createDefaultVenueDoc(venueId);
          db.insert(venueInfo);
        }
        venueInfo = doc;
        callback(venueInfo);
      });
      // db.find({venueId: venueId})
      //   .sort({ createdAt: -1 })
      //   .exec(function (err, docs) {
      //     console.log(docs);
      //     dataToSend = { data: docs };
      //     io.emit("chat", dataToSend);
      //   });
    });

    socket.on("disconnect", () => {
      delete clients[socket.id];
      io.sockets.emit("clientDisconnected", socket.id);
      console.log("client disconnected: ", socket.id);
    });

    socket.on("move", (data) => {
      let now = Date.now();
      if (clients[socket.id]) {
        clients[socket.id].position = data;
        clients[socket.id].lastSeenTs = now;
      }
    });
    socket.on("size", (data) => {
      if (clients[socket.id]) {
        clients[socket.id].size = data;
      }
    });
    socket.on("sceneIdx", (data) => {
      console.log("Switching to scene ", data);
      sceneId = data;
      io.emit("sceneIdx", data);
    });

    socket.on("chat", (message) => {
      db.insert(message);

      db.find({})
        .sort({ createdAt: -1 })
        .exec(function (err, docs) {
          console.log(docs);
          dataToSend = { data: docs };
          io.emit("chat", dataToSend);
        });
    });

    socket.on("showChat", (data) => {
      shouldShowChat = data;
      io.emit("showChat", data);
    });

    socket.on("updateFeature", (data) => {
      console.log("updateFeature: ", data);
      db.findOne({ _id: data._id }, function (err, doc) {
        if (doc) {
          console.log('updating doc!');
          db.update({ _id: data._id }, {...data}, function (err,doc){
            db.findOne({ _id: data ._id }, function (err, doc) {
              console.log(doc);
            });
          });
          // update doc
        } else {
          console.log('inserting doc!');
          db.insert({...data}, function(err, doc){
            console.log(doc);
            if (err){
              console.error(err);
            }
          });
        }
      });
    });

    socket.on("adminMessage", (message) => {
      adminMessage = message;
      io.emit("adminMessage", adminMessage);
    });

    socket.on("clearChat", () => {
      console.log("Clearing chat DB");
      db.remove({}, { multi: true }, function (err, numRemoved) {
        db.loadDatabase(function (err) {
          // done
        });
      });

      // resend empty data
      db.find({})
        .sort({ createdAt: -1 })
        .exec(function (err, docs) {
          console.log(docs);
          dataToSend = { data: docs };
          io.emit("chat", dataToSend);
        });
    });
  });

  // update all sockets at regular intervals
  setInterval(() => {
    io.sockets.emit("userPositions", clients);
  }, 200);

  // every X seconds, check for inactive clients and send them into cyberspace
  setInterval(() => {
    let now = Date.now();
    for (let id in clients) {
      if (now - clients[id].lastSeenTs > 120000) {
        console.log("Culling inactive user with id", id);
        clients[id].position[1] = -5; // send them underground
      }
    }
  }, 10000);

  new MediasoupManager({ io: io });
}

main();
