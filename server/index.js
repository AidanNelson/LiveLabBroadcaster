// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
const express = require("express");
const https = require("https");
const http = require("http");
// const Datastore = require("nedb");
const MediasoupManager = require("simple-mediasoup-peer-server");

// const venueDb = new Datastore({ filename: "venues.db", autoload: true });

const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require("fs");

const keyFile = fs.readFileSync("./X509-key-2845449389930019083.pem");
const certFile = fs.readFileSync("./X509-cert-2845449389930019083.pem");

const mongoClient = new MongoClient(
  "mongodb+srv://virtual-venue-db.kvb2fum.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
  {
    key: keyFile,
    cert: certFile,
    serverApi: ServerApiVersion.v1,
  },
);

// console.log(mongoClient);
const database = mongoClient.db("virtual-venue-db");
// const usersCollection = database.collection("users");
// const usersChangeStream = usersCollection.watch('/');
// usersChangeStream.on('change', (change) => {
//   console.log('Change in users collection: ',change);
// })

const venuesCollection = database.collection("venues");
const venueChangeStream = venuesCollection.watch("/");
venueChangeStream.on("change", (change) => {
  console.log("Change in venues collection: ", change);
  // send change to all users within a given venue
});

let clients = {};
let venueMembers = {};
let adminMessage = "";
let sceneId = 1; // start at no scene
let shouldShowChat = false;

async function main() {
  const app = express();

  const server = http.createServer(app);

  const port = 3030;
  server.listen(port);
  console.log(`Server listening on http://localhost:${port}`);

  // let db = new Datastore({
  //   filename: "info.db",
  //   timestampData: true,
  // }); //creates a new one if needed
  // db.loadDatabase(); //loads the db with the data

  let io = require("socket.io")();
  io.listen(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // const updateVenueMembers = (venueId) => {
  //   db.findOne({ venueId: venueId }, (err, doc) => {
  //     let venueInfo = doc;
  //     venues[venueId].forEach((socket) => {
  //       socket.emit("venueInfo", venueInfo);
  //     });
  //   });
  // };

  io.on("connection", (socket) => {
    console.log(
      "A client connected and has ID " +
        socket.id +
        ". We npw have " +
        io.engine.clientsCount +
        " clients connected.",
    );

    // send chat
    // db.find({})
    //   .sort({ createdAt: -1 })
    //   .exec(function (err, docs) {
    //     dataToSend = { data: docs };
    //     socket.emit("chat", dataToSend);
    //   });

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

    socket.on("joinVenue", (venueId) => {
      if (!venueMembers[venueId]) venueMembers[venueId] = [];
      venueMembers[venueId].push(socket);
      // db.findOne({ venueId: venueId }, (err, doc) => {
      //   let venueInfo = doc;
      // if (!doc) {
      //   venueInfo = createDefaultVenueDoc(venueId);
      //   db.insert(venueInfo);
      // }
      // venueInfo = doc;
      // callback(venueInfo);
      socket.emit("venueInfo", venueInfo);
      // });
    });

    // socket.on("createVenue", (callback) => {
    //   console.log("creating new venue");

    // venueDb.insert({}, (err, doc) => {
    //   if (err) {
    //     return err;
    //   }
    //   if (doc) {
    //     callback(doc);
    //   }
    // });
    // });

    // socket.on("updateVenue", (venueInfo, callback) => {
    //   venueDb.update(
    //     { _id: venueInfo._id },
    //     venueInfo.update,
    //     { returnUpdatedDocs: true },
    //     (err, numUpdated, doc) => {
    //       if (err) {
    //         callback("Error finding venue");
    //       } else {
    //         callback(doc);
    //       }
    //     },
    //   );
    // });

    // socket.on("getVenuesInfo", (callback) => {
    //   venueDb.find({}, (err, docs) => {
    //     if (err) {
    //       callback("Error finding venues info");
    //     } else {
    //       callback(docs);
    //     }
    //   });
    // });

    // socket.on("getVenueInfo", (venueId, callback) => {
    //   console.log("getting info for venue: ", venueId);
    //   // The same rules apply when you want to only find one document
    //   db.findOne({ venueId: venueId }, (err, doc) => {
    //     let venueInfo = null;
    //     if (!doc) {
    //       venueInfo = createDefaultVenueDoc(venueId);
    //       db.insert(venueInfo);
    //     }
    //     venueInfo = doc;
    //     callback(venueInfo);
    //   });
    // db.find({venueId: venueId})
    //   .sort({ createdAt: -1 })
    //   .exec(function (err, docs) {
    //     console.log(docs);
    //     dataToSend = { data: docs };
    //     io.emit("chat", dataToSend);
    //   });
    // });

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

    // socket.on("chat", (message) => {
    //   db.insert(message);

    //   db.find({})
    //     .sort({ createdAt: -1 })
    //     .exec(function (err, docs) {
    //       console.log(docs);
    //       dataToSend = { data: docs };
    //       io.emit("chat", dataToSend);
    //     });
    // });

    // socket.on("showChat", (data) => {
    //   shouldShowChat = data;
    //   io.emit("showChat", data);
    // });

    // socket.on("updateFeature", (data) => {
    //   console.log("updateFeature: ", data);
    //   db.findOne({ _id: data._id }, function (err, doc) {
    //     if (doc) {
    //       console.log("updating doc!");
    //       db.update({ _id: data._id }, { ...data }, function (err, doc) {
    //         if (doc) {
    //           io.emit("venueInfo");
    //           updateVenueMembers(data.venueId);
    //         }
    //       });
    //       // update doc
    //     } else {
    //       console.log("inserting doc!");
    //       db.insert({ ...data }, function (err, doc) {
    //         console.log(doc);
    //         updateVenueMembers(data.venueId);
    //         if (err) {
    //           console.error(err);
    //         }
    //       });
    //     }
    //   });
    // });

    //   socket.on("adminMessage", (message) => {
    //     adminMessage = message;
    //     io.emit("adminMessage", adminMessage);
    //   });

    //   socket.on("clearChat", () => {
    //     console.log("Clearing chat DB");
    //     db.remove({}, { multi: true }, function (err, numRemoved) {
    //       db.loadDatabase(function (err) {
    //         // done
    //       });
    //     });

    //     // resend empty data
    //     db.find({})
    //       .sort({ createdAt: -1 })
    //       .exec(function (err, docs) {
    //         console.log(docs);
    //         dataToSend = { data: docs };
    //         io.emit("chat", dataToSend);
    //       });
    //   });
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
