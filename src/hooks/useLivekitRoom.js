"use client";

import { useEffect, useState } from "react";
import { Room, RoomEvent, DisconnectReason, ConnectionState } from "livekit-client";
import { supabase } from "@/components/SupabaseClient";
import debug from "debug";
const logger = debug("broadcaster:useLivekitRoom");

const tabSessionId = Math.random().toString(36).slice(2, 10);

async function waitForSession(maxWaitMs = 5000) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      sub.unsubscribe();
      resolve(null);
    }, maxWaitMs);

    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          clearTimeout(timeout);
          sub.unsubscribe();
          resolve(session);
        }
      },
    );
  });
}

async function fetchToken(roomId) {
  const session = await waitForSession();
  if (!session) {
    throw new Error("No auth session available");
  }

  const res = await fetch("/api/livekit/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ roomId, sessionId: tabSessionId }),
  });

  if (!res.ok) {
    throw new Error(`Token fetch failed: ${res.status}`);
  }

  const { token } = await res.json();
  return token;
}

const MAX_RECONNECT_ATTEMPTS = 3;
const BASE_RECONNECT_DELAY_MS = 1000;

export const useLivekitRoom = ({ roomId }) => {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    // Locally-scoped per effect invocation -- immune to React Strict Mode
    // double-mount because each mount gets its own `cancelled` flag.
    let cancelled = false;
    let currentRoom = null;
    let reconnectAttempts = 0;

    const connectToRoom = async () => {
      let newRoom;
      try {
        const token = await fetchToken(roomId);
        if (cancelled) return;

        const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
        if (!livekitUrl) {
          console.error("NEXT_PUBLIC_LIVEKIT_SERVER_URL is not set");
          return;
        }

        newRoom = new Room({
          disconnectOnPageLeave: false,
        });

        newRoom.on(RoomEvent.Reconnecting, () => {
          logger("Room reconnecting...");
        });

        newRoom.on(RoomEvent.Reconnected, () => {
          logger("Room reconnected");
        });

        newRoom.on(RoomEvent.SignalReconnecting, () => {
          logger("Signal (WebSocket) reconnecting...");
        });

        newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
          logger("Connection state changed:", state);
        });

        newRoom.on(RoomEvent.Disconnected, (reason) => {
          logger("Room disconnected, reason:", reason);
          if (cancelled) return;
          currentRoom = null;
          setRoom(null);

          const intentional =
            reason === DisconnectReason.CLIENT_INITIATED ||
            reason === DisconnectReason.DUPLICATE_IDENTITY;

          if (!intentional && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1);
            logger(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(() => {
              if (!cancelled) connectToRoom();
            }, delay);
          }
        });

        await newRoom.connect(livekitUrl, token);

        if (cancelled) {
          newRoom.disconnect();
          return;
        }

        logger("Connected to LiveKit room:", roomId, "sessionId:", tabSessionId);
        reconnectAttempts = 0;
        currentRoom = newRoom;
        setRoom(newRoom);
      } catch (err) {
        console.error("Failed to connect to LiveKit room:", err);
        if (newRoom) {
          try { newRoom.disconnect(); } catch {}
        }
        if (cancelled) return;

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1);
          logger(`Connect failed, retrying in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
          setTimeout(() => {
            if (!cancelled) connectToRoom();
          }, delay);
        }
      }
    };

    connectToRoom();

    return () => {
      cancelled = true;
      if (currentRoom) {
        logger("Disconnecting from LiveKit room:", roomId);
        currentRoom.disconnect();
        currentRoom = null;
      }
      setRoom(null);
    };
  }, [roomId]);

  return { room };
};
