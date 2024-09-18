"use client";
// https://socket.io/how-to/use-with-react
import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? "https://realtime.livelab.app"
    : "http://localhost:3030";
export const socket = io(URL);
