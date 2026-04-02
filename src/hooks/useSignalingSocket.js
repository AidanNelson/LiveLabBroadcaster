"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import debug from "debug";
const logger = debug("broadcaster:useSignalingSocket");

export const useSignalingSocket = ({ url, port, roomId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    const socketUrl = port ? `${url}:${port}` : url;
    logger("Connecting socket to:", socketUrl);

    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      logger("Socket connected, joining stage:", roomId);
      newSocket.emit("joinStage", roomId);
    });

    window.socket = newSocket;
    window.smp = undefined;
    setSocket(newSocket);

    return () => {
      logger("Disconnecting socket, leaving stage:", roomId);
      newSocket.emit("leaveStage", roomId);
      newSocket.disconnect();
      window.socket = undefined;
    };
  }, [url, port, roomId]);

  return { socket };
};
