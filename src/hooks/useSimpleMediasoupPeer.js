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

export const useSimpleMediasoupPeer = ({ autoConnect, roomId, url, port }) => {
  const [peer, setPeer] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomId) return; // roomId will not be set until we retrieve the stageId from the server
    console.log("creating new peer for room: ", roomId, 'at url:',url);
    const newPeer = new SimpleMediasoupPeer({
      autoConnect,
      roomId,
      url,
      port,
    });
    setPeer(
      newPeer
    );

    window.smp = newPeer;
    setSocket(newPeer.socket);

    return () => {
      // TODO cleanup peer and socket
      newPeer.disconnectFromMediasoup();
      newPeer.socket.disconnect();
      window.smp = undefined;
    }
  }, [autoConnect, roomId, url, port]);

  useEffect(() => {
    if (!peer) return;
    console.log("Joining room: ", roomId);

    peer.joinRoom(roomId);
  }, [roomId]);

  return { peer, socket };
};
