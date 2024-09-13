import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// set debugging level
process.env.DEBUG = "";

// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
require("dotenv").config();

const http = require("http");
import { stageInfoEmitter } from "./db.js";
// const { getStageInfo, watchStageChanges } = require("./db");
// const Datastore = require("nedb");
// const MediasoupManager = require("simple-mediasoup-peer-server");

const express = require("express");
const session = require("express-session");
var cors = require("cors");
var createError = require("http-errors");
// var path = require('path');
var cookieParser = require("cookie-parser");
var csrf = require("csurf");
var passport = require("passport");
// const authRouter = require('./routes/auth.js');

import morgan from "morgan";
import { authRouter } from "./routes/auth.js";
import { stageRouter } from "./routes/stage.js";
import { getSessionsDatabase } from "./db.js";
import lowdbStore from "connect-lowdb";

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// DB and Chat Setup
// const db = {};
// db.chat = new Datastore({ filename: "chat.db", autoload: true });
// db.displayNamesForChat = new Datastore({
//   filename: "displayNames.db",
//   autoload: true,
// });
// db.auctionData = new Datastore({
//   filename: "auctionData.db",
//   autoload: "true",
// });

// function updateChatForStageId(stageId) {
//   if (stageId === null) return;
//   console.log("updating chat for stage", stageId);

//   const displayNames = {};
//   db.displayNamesForChat.find({}, function (err, docs) {
//     if (err) {
//       console.log("Error getting display names for chat", err);
//     }
//     for (const doc of docs) {
//       displayNames[doc.socketId] = doc.displayName;
//     }
//   });
//   db.chat.find({ stageId: stageId }, function (err, docs) {
//     if (err) {
//       console.log("Error getting chat messages", err);
//     }
//     for (const socket of stageSubscriptions[stageId]) {
//       socket.emit("chat", { chats: docs, displayNamesForChat: displayNames });
//     }
//   });
// }

// function clearChatForStageId(stageId) {
//   if (stageId === null) return;
//   console.log("Clearing chat for stage", stageId);
//   db.chat.remove(
//     { stageId: stageId },
//     { multi: true },
//     function (err, numRemoved) {
//       if (err) {
//         console.log("Error getting chat messages", err);
//       } else {
//         console.log("Removed ", numRemoved, "chat messages.");
//       }
//     },
//   );
// }

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Stage DB Setup

// for real-time mongodb subscriptions
let stageSubscriptions = {};

stageInfoEmitter.on("update", ({ id, update }) => {
  console.log("Stage info updated", id, update);
});

// watchStageChanges((change) => {
//   const doc = change.fullDocument;
//   if (!doc || !doc?.stageId || !stageSubscriptions[doc.stageId]) return;
//   for (const socket of stageSubscriptions[doc.stageId]) {
//     socket.emit("stageInfo", doc);
//   }
// });

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
  // setup from https://github.com/passport/todos-express-password/tree/master
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // we will use a lowdb database to store sessions
  const { db } = await getSessionsDatabase();
  const LowdbStore = lowdbStore(session);

  // setup sessions
  app.use(
    session({
      secret: "keyboardcat",
      cookie: {
        secure: false,
        sameSite: "None",
        httpOnly: true, // Cookie is not accessible via JavaScript
      }, // Set to true if using HTTPS
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      store: new LowdbStore({ db }),
    }),
  );

  // TODO look at if this needs to be implemented...
  // app.use(csrf());
  // app.use(function (req, res, next) {
  //   var msgs = req.session.messages || [];
  //   res.locals.messages = msgs;
  //   res.locals.hasMessages = !!msgs.length;
  //   req.session.messages = [];
  //   next();
  // });

  // app.use(function (req, res, next) {
  //   res.locals.csrfToken = req.csrfToken();
  //   next();
  // });

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/auth", authRouter);
  app.use("/stage", stageRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
  });

  const server = http.createServer(app);

  const port = 3030;
  server.listen(port);
  console.log(`Server listening on http://localhost:${port}`);

  // let io = require("socket.io")();
  // io.listen(server, {
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  // });

  // io.on("connection", (socket) => {
  //   console.log(
  //     "A client connected and has ID " +
  //       socket.id +
  //       ". We npw have " +
  //       io.engine.clientsCount +
  //       " clients connected.",
  //   );

  //   socket.emit("serverTime", { serverTime: Date.now() });

  //   socket.emit("clients", Object.keys(clients));
  //   socket.broadcast.emit("clientConnected", socket.id);

  //   // then add to our clients object
  //   clients[socket.id] = { stageId: null, displayName: null }; // store initial client state here

  //   socket.on("joinStage", async (stageId) => {
  //     console.log("socket", socket.id, "joinging stage", stageId);

  //     clients[socket.id].stageId = stageId;
  //     if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
  //     stageSubscriptions[stageId].push(socket);

  //     const stageInfo = await getStageInfo({ stageId });
  //     // TODO check for stageInfo having length?
  //     socket.emit("stageInfo", stageInfo);

  //     const displayNames = {};
  //     db.displayNamesForChat.find({}, function (err, docs) {
  //       if (err) {
  //         console.log("Error getting display names for chat", err);
  //       }
  //       for (const doc of docs) {
  //         displayNames[doc.socketId] = doc.displayName;
  //       }
  //     });

  //     db.chat.find({ stageId: stageId }, function (err, docs) {
  //       if (err) {
  //         console.log("Error getting chat messages", err);
  //       }
  //       socket.emit("chat", { chats: docs, displayNamesForChat: displayNames });
  //     });
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
  //   });

  //   socket.on("relay", (data) => {
  //     io.sockets.emit("relay", data);
  //   });

  //   socket.on("chat", (msg) => {
  //     const chatMessage = {
  //       message: msg,
  //       from: socket.id,
  //       stageId: clients[socket.id].stageId,
  //       timestamp: Date.now(),
  //     };
  //     db.chat.insert(chatMessage, (err) => {
  //       if (err) {
  //         console.log("Error inserting chat message", err);
  //       }
  //     });
  //     updateChatForStageId(clients[socket.id].stageId);
  //   });

  //   socket.on("clearChat", () => {
  //     if (clients[socket.id].stageId) {
  //       clearChatForStageId(clients[socket.id].stageId);
  //     }
  //   });

  //   socket.on("setDisplayNameForChat", (displayName) => {
  //     db.displayNamesForChat.insert(
  //       { socketId: socket.id, displayName },
  //       (err) => {
  //         if (err) {
  //           console.log("Error inserting display name", err);
  //         }
  //         updateChatForStageId(clients[socket.id].stageId);
  //       },
  //     );
  //     // displayNamesForChat[socket.id] = displayName;
  //   });

  //   socket.on("saveAuctionData", ({ name, email, paddleNumber, info }) => {
  //     db.auctionData.insert({
  //       socketId: socket.id,
  //       name: name,
  //       paddleNumber: paddleNumber,
  //       email: email,
  //       info: info,
  //       timestamp: Date.now(),
  //     });
  //   });

  //   socket.on("getAuctionData", () => {
  //     db.auctionData.find({}, function (err, docs) {
  //       if (err) {
  //         console.log("Error getting display names for chat", err);
  //       }
  //       socket.emit("auctionData", docs);
  //     });
  //   });
  // });

  // // update all sockets at regular intervals
  // setInterval(() => {
  //   io.sockets.emit("peerInfo", realTimePeerInfo);
  // }, 50);

  // setInterval(() => {
  //   io.sockets.emit("serverTime", { serverTime: Date.now() });
  // }, 500);

  // // every X seconds, check for inactive clients and send them into cyberspace
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
