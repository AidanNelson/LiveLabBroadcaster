// https://socket.io/how-to/use-with-react


import { io } from 'socket.io-client';
import {SimpleMediasoupPeer} from "simple-mediasoup-peer-client"

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3030';

// export const socket = io(URL);

// available options for initializing a new peer
const options = {
    autoConnect: true,
    roomId: 'myCoolRoom123',
    // socket options
    socket: null,
    url: 'https://localhost',
    port: 443,
    socketClientOptions: {
      path: "/socket.io/",
    },
  }
export const peer = new SimpleMediasoupPeer(options);

setTimeout(() => {

peer.send('hello');
},5000)
