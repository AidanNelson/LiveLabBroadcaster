"use client";

import { useEffect, useState, useRef } from "react";
import { Room, RoomEvent, DisconnectReason } from "livekit-client";
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

export const useLivekitRoom = ({ roomId }) => {
  const [room, setRoom] = useState(null);
  const roomRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const token = await fetchToken(roomId);
        if (cancelled) return;

        const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
        if (!livekitUrl) {
          console.error("NEXT_PUBLIC_LIVEKIT_SERVER_URL is not set");
          return;
        }

        const newRoom = new Room();

        newRoom.on(RoomEvent.Disconnected, (reason) => {
          logger("Room disconnected, reason:", reason);
          if (cancelled) return;
          roomRef.current = null;
          setRoom(null);
        });

        await newRoom.connect(livekitUrl, token);

        if (cancelled) {
          newRoom.disconnect();
          return;
        }

        logger("Connected to LiveKit room:", roomId, "sessionId:", tabSessionId);
        roomRef.current = newRoom;
        setRoom(newRoom);
      } catch (err) {
        console.error("Failed to connect to LiveKit room:", err);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (roomRef.current) {
        logger("Disconnecting from LiveKit room:", roomId);
        roomRef.current.disconnect();
        roomRef.current = null;
        setRoom(null);
      }
    };
  }, [roomId]);

  return { room };
};
