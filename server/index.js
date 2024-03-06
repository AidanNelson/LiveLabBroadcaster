require("dotenv").config();
const express = require("express");
// const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const authRouter = require("./routes/auth.js");
// import "dotenv/config";
// import express from "express";
// import * as fs from "fs";
// import * as http from "http";
// import { Server } from "socket.io";
// console.log((process.env.DEBUG = "SimpleMediasoupPeer*"));
// const MediasoupManager = require("simple-mediasoup-peer-server");

// const keyFile = fs.readFileSync("./db-key.pem");
// const certFile = fs.readFileSync("./db-cert.pem");

// const mongoClient = new MongoClient(
//   process.env.MONGODB_URL,
//   {
//     key: keyFile,
//     cert: certFile,
//     serverApi: ServerApiVersion.v1,
//   },
// );

// const database = mongoClient.db("virtual-venue-db");
// const stagesCollection = database.collection("stages");
// const stagesChangeStream = stagesCollection.watch("/");
// stagesChangeStream.on("change", (change) => {
//   const doc = change.fullDocument;
//   if (!doc || !doc?.stageId || !stageSubscriptions[doc.stageId]) return;
//   for (const socket of stageSubscriptions[doc.stageId]) {
//     socket.emit("stageInfo", doc);
//   }
// });

let realTimePeerInfo = {};

let clients = {};
let adminMessage = "";
let sceneId = 1; // start at no scene
let shouldShowChat = false;

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // set up auth with passport and sessions
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  }));
  // app.use(passport.initialize());
  app.use(passport.authenticate('session'));

  app.use(authRouter);

  // Signup route
  // app.post("/signup", async (req, res) => {
  //   const { username, password } = req.body;
  //   const existingUser = await findUser({ username });
  //   if (existingUser) {
  //     return res
  //       .status(400)
  //       .json({ message: "Could not complete signup.  Please try again." });
  //   } else {
  //     let newUser = createUser({ username, password });
  //     res.status(200).json({ message: "Signup completed successfully." });
  //   }
  // });

  // // Login route using passport
  // app.post('/login', (req, res, next) => {
  //   passport.authenticate('local', (err, user, info) => {
  //       if (err) { return next(err); }
  //       if (!user) { return res.status(401).json({ message: info.message }); }
  //       // Generate JWT token upon successful login
  //       const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 }); // Expires in 24 hours
  //       return res.status(200).json({ auth: true, token });
  //   })(req, res, next);
  // });

  // // Logout route
  // app.get('/logout', (req, res) => {
  //   req.logout();
  //   res.status(200).json({ auth: false, token: null });
  // });

  const server = http.createServer(app);

  const port = 3030;
  server.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
  const io = new Server(server);
  io.listen(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // io.on("connection", (socket) => {
  //   console.log(
  //     "A client connected and has ID " +
  //       socket.id +
  //       ". We npw have " +
  //       io.engine.clientsCount +
  //       " clients connected.",
  //   );

  //   socket.emit("clients", Object.keys(clients));
  //   socket.broadcast.emit("clientConnected", socket.id);

  //   // then add to our clients object
  //   clients[socket.id] = {}; // store initial client state here

  //   socket.on("joinStage", async (stageId) => {
  //     console.log("socket", socket.id, "joinging stage", stageId);
  //     if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
  //     stageSubscriptions[stageId].push(socket);

  //     await mongoClient.connect();
  //     const database = mongoClient.db("virtual-venue-db");
  //     const collection = database.collection("stages");
  //     const stage = await collection.findOne({ stageId });
  //     socket.emit("stageInfo", stage);
  //   });

  //   socket.on("disconnect", () => {
  //     delete clients[socket.id];
  //     delete realTimePeerInfo[socket.id];
  //     io.sockets.emit("clientDisconnected", socket.id);
  //     console.log("client disconnected: ", socket.id);
  //   });

  //   socket.on("mousePosition", (data) => {
  //     let now = Date.now();
  //     if (!realTimePeerInfo[socket.id]) {
  //       realTimePeerInfo[socket.id] = {};
  //     }

  //     realTimePeerInfo[socket.id].position = data;
  //     realTimePeerInfo[socket.id].lastSeenTs = now;
  //   });

  //   socket.on("savePeerData", (msg) => {
  //     if (!realTimePeerInfo[socket.id]) {
  //       realTimePeerInfo[socket.id] = {};
  //     }

  //     realTimePeerInfo[socket.id][msg.type] = msg.data;

  //     // from client side
  //     // socket.emit('savePeerData', {
  //     //   type: 'flagStatus',
  //     //   data: true
  //     // })

  //     // {'asidufgaasifubasidu12iu312i' {position: [0.2, 0.3], 'flagStatus': true, 'flagPosition': [0.2, 0.3]}}
  //   });
  //   socket.on("relay", (data) => {
  //     io.sockets.emit("relay", data);
  //   });
  // });

  // update all sockets at regular intervals
  // setInterval(() => {
  //   io.sockets.emit("peerInfo", realTimePeerInfo);
  // }, 50);

  // every X seconds, check for inactive clients and send them into cyberspace
  // setInterval(() => {
  //   let now = Date.now();
  //   for (let id in realTimePeerInfo) {
  //     if (now - realTimePeerInfo[id].lastSeenTs > 5000) {
  //       console.log("Culling inactive user with id", id);
  //       delete realTimePeerInfo[id];
  //     }
  //   }
  // }, 5000);

  // new MediasoupManager({ io: io });
}

main();
