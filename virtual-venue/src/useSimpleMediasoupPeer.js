// https://socket.io/how-to/use-with-react

import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";

import {  useEffect, useState } from "react";

export const useSimpleMediasoupPeer = (roomId, initialized) => {
  const [peer, setPeer] = useState(
    null
  );
    useEffect(() => {
        if (!initialized) return;
        setPeer(new SimpleMediasoupPeer({
            autoConnect: true,
            roomId: roomId,
            // socket options
            socket: null,
            url: "https://localhost",
            port: 443,
            socketClientOptions: {
              path: "/socket.io/",
            },
          }))
    })


  return {
    peer,
  };
};
