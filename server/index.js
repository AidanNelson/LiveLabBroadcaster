// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
const express = require('express');
// const https = require("https");
const http = require('http');
const Datastore = require('nedb');
const MediasoupManager = require('simple-mediasoup-peer-server');

let clients = {};
let adminMessage = '';
let sceneId = null; // start at no scene
let shouldShowChat = false;

async function main() {
  const app = express();

  const server = http.createServer(app);

  const distFolder = process.cwd() + '/src';
  console.log('Serving static files at ', distFolder);
  app.use(express.static(process.cwd() + '/src'));

  const port = 3131;
  server.listen(port);
  console.log(`Server listening on port ${port}`);

  let db = new Datastore({
    filename: 'chat.db',
    timestampData: true,
  }); //creates a new one if needed
  db.loadDatabase(); //loads the db with the data

  let io = require('socket.io')();
  io.listen(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(
      'User ' +
        socket.id +
        ' connected, there are ' +
        io.engine.clientsCount +
        ' clients connected'
    );

    // send chat
    db.find({})
      .sort({ createdAt: -1 })
      .exec(function (err, docs) {
        dataToSend = { data: docs };
        socket.emit('chat', dataToSend);
      });

    socket.emit('clients', Object.keys(clients));
    if (sceneId) socket.emit('sceneIdx', sceneId);
    socket.emit('adminMessage', adminMessage);
    socket.emit('showChat', shouldShowChat);

    socket.broadcast.emit('clientConnected', socket.id);

    // then add to our clients object
    clients[socket.id] = {}; // store initial client state here
    // clients[socket.id].position = [5000, 100, 0];
    clients[socket.id].mousePosition = { x: -100, y: -100 };
    clients[socket.id].size = 1;

    socket.on('disconnect', () => {
      delete clients[socket.id];
      io.sockets.emit('clientDisconnected', socket.id);
      console.log('client disconnected: ', socket.id);
    });

    socket.on('interaction', (msg) => {
      console.log('relaying socket message');
      io.sockets.emit('interaction', msg);
    });

    // the server will aggregate mouse position data so the clients receive a single update for all peers
    socket.on('mousePosition', (msg) => {
      clients[socket.id].mousePosition = msg;
    });

    socket.on('move', (data) => {
      let now = Date.now();
      if (clients[socket.id]) {
        clients[socket.id].position = data;
        clients[socket.id].lastSeenTs = now;
      }
    });
    socket.on('size', (data) => {
      if (clients[socket.id]) {
        clients[socket.id].size = data;
      }
    });
    socket.on('sceneIdx', (data) => {
      console.log('Switching to scene ', data);
      sceneId = data;
      io.emit('sceneIdx', data);
    });

    socket.on('chat', (message) => {
      db.insert(message);

      db.find({})
        .sort({ createdAt: -1 })
        .exec(function (err, docs) {
          console.log(docs);
          dataToSend = { data: docs };
          io.emit('chat', dataToSend);
        });
    });

    // Perhaps create a generic type
    socket.on('speech', (message) => {
      io.emit('speech', message);
    });

    socket.on('osc', (message) => {
      console.log('got OSC, rebroadcasting:', message);
      io.emit('osc', message);
    });

    socket.on('oscForSockets', (message) => {
      console.log('got OSC, rebroadcasting:', message);
      io.emit('oscForSockets', message);
    });

    socket.on('showChat', (data) => {
      shouldShowChat = data;
      io.emit('showChat', data);
    });

    socket.on('clearChat', () => {
      console.log('Clearing chat DB');
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
          io.emit('chat', dataToSend);
        });
    });
  });

  // update all sockets at regular intervals
  setInterval(() => {
    io.sockets.emit('userPositions', clients);
    io.sockets.emit('mousePositions', clients);
  }, 20);

  // every X seconds, check for inactive clients and send them into cyberspace
  setInterval(() => {
    let now = Date.now();
    for (let id in clients) {
      if (now - clients[id].lastSeenTs > 120000) {
        console.log('Culling inactive user with id', id);
        clients[id].position[1] = -5; // send them underground
      }
    }
  }, 10000);

  new MediasoupManager(io);
}

main();
