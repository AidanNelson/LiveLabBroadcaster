// HTTP Server setup:
// https://stackoverflow.com/questions/27393705/how-to-resolve-a-socket-io-404-not-found-error
const express = require('express'),
    http = require('http')
const app = express()
const server = http.createServer(app)
const MediasoupManager = require("./MediasoupManager");

let io = require('socket.io')()
io.listen(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})

const distFolder = process.cwd() + '/dist'
console.log('Serving static files at ', distFolder)
app.use(express.static(process.cwd() + '/dist'))

const port = 5000;
server.listen(port)
console.log(`Server listening on http://localhost:${port}`);

let clients = {};
let sceneId = 1; // start at no scene

function setupSocketServer(mediasoupManager) {
    io.on('connection', (socket) => {
        console.log('User ' + socket.id + ' connected, there are ' + io.engine.clientsCount + ' clients connected')

        socket.emit('clients', Object.keys(clients));
        socket.emit('sceneIdx', sceneId);
        socket.broadcast.emit('clientConnected', socket.id);

        // then add to our clients object
        clients[socket.id] = {}; // store initial client state here
        clients[socket.id].position = [0, 100, 0];

        socket.on('disconnect', () => {
            delete clients[socket.id];
            io.sockets.emit('clientDisconnected', socket.id);
            console.log('client disconnected: ', socket.id);
        })

        socket.on('move', (data) => {
            let now = Date.now();
            if (clients[socket.id]) {
                clients[socket.id].position = data;
                clients[socket.id].lastSeenTs = now;
            }
        });
        socket.on('sceneIdx', (data) => {
            console.log('Switching to scene ', data);
            sceneId = data;
            io.emit('sceneIdx', data);
        });
    });

    // update all sockets at regular intervals
    setInterval(() => {
        io.sockets.emit('userPositions', clients);
    }, 200);

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


}


function main() {
    let mediasoupManager = new MediasoupManager(io);
    setupSocketServer();
}

main();