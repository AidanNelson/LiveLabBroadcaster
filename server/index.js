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
const session = require("express-session");
var cors = require("cors");
var createError = require("http-errors");
// var path = require('path');
var cookieParser = require("cookie-parser");
// var csrf = require("csurf");
var passport = require("passport");

import morgan from "morgan";
import { authRouter } from "./routes/auth.js";
import { stageRouter } from "./routes/stage.js";
import {
  getChatsDatabase,
  getDisplayNamesForChatDatabase,
  getSessionsDatabase,
  getStageInfo,
  getStageInfoFromSlug,
  stageInfoEmitter,
} from "./db.js";

import {
  clearChatsForStage,
  getChatsAndDisplayNames,
  updateDisplayNameForSocket,
  addChatMessage,
} from "./chat.js";
import lowdbStore from "connect-lowdb";

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
// Stage DB Setup

// for real-time mongodb subscriptions
let stageSubscriptions = {};

// update all sockets subscribed to a particular stage's updates
stageInfoEmitter.on("update", ({ stageId, update }) => {
  if (!stageSubscriptions[stageId]) return;
  for (const socket of stageSubscriptions[stageId]) {
    socket.emit("stageInfo", update);
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

    socket.on("joinStage", async (stageId) => {
      console.log("socket", socket.id, "joinging stage", stageId);

      // update our clients object
      clients[socket.id].stageId = stageId;

      // subscribe to updates for given stageId
      if (!stageSubscriptions[stageId]) stageSubscriptions[stageId] = [];
      stageSubscriptions[stageId].push(socket);

      // send stage info
      const stageInfo = await getStageInfo({ stageId });
      socket.emit("stageInfo", stageInfo);

      // send chat info
      const info = await getChatsAndDisplayNames({ stageId: stageId });
      socket.emit("chat", info);
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

    socket.on("chat", async (msg) => {
      await addChatMessage({
        stageId: clients[socket.id].stageId,
        socketId: socket.id,
        msg,
      });
      const stageId = clients[socket.id].stageId;
      if (!stageSubscriptions[stageId]) return;
      const info = await getChatsAndDisplayNames({ stageId: stageId });
      for (const socket of stageSubscriptions[stageId]) {
        socket.emit("chat", info);
      }
    });

    socket.on("clearChat", () => {
      clearChatsForStage({ stageId: clients[socket.id].stageId });
    });

    socket.on("setDisplayNameForChat", async (displayName) => {
      await updateDisplayNameForSocket({ socketId: socket.id, displayName });
      const stageId = clients[socket.id].stageId;
      if (!stageSubscriptions[stageId]) return;
      const info = await getChatsAndDisplayNames({ stageId: stageId });
      for (const socket of stageSubscriptions[stageId]) {
        socket.emit("chat", info);
      }
    });
  });

  // update all sockets at regular intervals
  setInterval(() => {
    io.sockets.emit("peerInfo", realTimePeerInfo);
  }, 50);

  setInterval(() => {
    io.sockets.emit("serverTime", { serverTime: Date.now() });
  }, 500);

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
