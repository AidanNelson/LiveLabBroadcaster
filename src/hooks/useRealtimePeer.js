// https://socket.io/how-to/use-with-react
import { useEffect, useState } from "react";
import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";

// {
//     autoConnect: true,
//     roomId: 'myCoolRoom123',
//     // socket options
//     socket: null,
//     url: 'http://localhost',
//     port: 3030,
//     socketClientOptions: {
//     path: "/socket.io/",
//     },
// }

export const useRealtimePeer = ({ autoConnect, roomId, url, port }) => {
  const [peer, setPeer] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomId) return; // roomId will not be set until we retrieve the stageId from the server
    console.log("Creating new peer for room: ", roomId, 'at url:',url);
    const newPeer = new SimpleMediasoupPeer({
      autoConnect,
      roomId,
      url,
      port,
    });
    console.log("Joining room: ", roomId);

    newPeer.joinRoom(roomId);

    setPeer(
      newPeer
    );

    window.smp = newPeer;
    window.socket = newPeer.socket;
    setSocket(newPeer.socket);

    return () => {
      // TODO cleanup peer and socket
      newPeer.disconnectFromMediasoup();
      newPeer.socket.disconnect();
      window.smp = undefined;
      window.socket = undefined;
    }
  }, [autoConnect, roomId, url, port]);

  return { peer, socket };
};
