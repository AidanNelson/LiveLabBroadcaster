"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "../../hooks/socket";

export default function AdminPage() {
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        function onConnectionHandler (ev) {
            setIsConnected(true);
        }
        function onDisconnectionHandler (ev) {
            setIsConnected(false);
        }
        socket.on('connect',onConnectionHandler);
        socket.on('disconnect',onDisconnectionHandler);

        return () => {
            socket.off('connect', onConnectionHandler);
            socket.off('disconnect',onDisconnectionHandler);
        }
    })
  return (
<>
      <div>Socket Connected? {isConnected.toString()}</div>
      <button>Add Venue</button>
      </>
 );
}
