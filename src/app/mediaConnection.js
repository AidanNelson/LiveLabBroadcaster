// https://socket.io/how-to/use-with-react
import {SimpleMediasoupPeer} from "simple-mediasoup-peer-client"

// available options for initializing a new peer
const options = {
    autoConnect: true,
    roomId: 'myCoolRoom123',
    // socket options
    socket: null,
    url: 'http://localhost',
    port: 3030,
    socketClientOptions: {
      path: "/socket.io/",
    },
  }
export const peer = new SimpleMediasoupPeer(options);