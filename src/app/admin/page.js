"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createStage } from "@/components/db";

export default function AdminPage() {
  const [name, setName] = useState("Orpheus"); // Add venueId state

  const addVenue = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost:3030";
      const res = await fetch(url + `/stage/create`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      console.log("Create stage response?", res);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)} // Update venueId state on input change
        placeholder="Orpheus"
      />
      <button onClick={addVenue}>Add Venue</button>
    </>
  );
}
