"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Edit } from "@mui/icons-material";

export default function AdminPage() {
  const user = useUser({ redirectTo: "/login" });
  const [name, setName] = useState("Orpheus"); // Add venueId state
  const statusRef = useRef();
  const [stagesInfo, setStagesInfo] = useState([]);
  const updateStageName = async (newName) => {
    console.log(newName);
  }

  const getAllStagesInfo = async () => {
    try {
      const url =
        process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ||
        "http://localhost:3030";
      const res = await fetch(url + `/stage/info`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ name }),
      });
      if (res.status === 200) {
        let { info } = await res.json();
        console.log(info);
        setStagesInfo(info);
      } else {
        console.error("Failed to get stages info.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getAllStagesInfo();
  }, []);

  const addVenue = async () => {
    try {
      const url =
        process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ||
        "http://localhost:3030";
      const res = await fetch(url + `/stage/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.status === 200) {
        let info = await res.json();
        statusRef.current.innerHTML = `Stage created with id: ${info.id}`;
        console.log("Stage created with id:", info.id);
      } else {
        statusRef.current.innerHTML = "Failed to create stage";
        console.error("Failed to create stage");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;
  return (
    <>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)} // Update venueId state on input change
        placeholder="Orpheus"
      />
      <button onClick={addVenue}>Add Venue</button>
      <div ref={statusRef}></div>

      {stagesInfo.map((stageInfoDoc) => {
        return (
          <>
            <div>
              <h3>Stage Name: {stageInfoDoc.name}</h3>
              <a href={"/stage/" + stageInfoDoc.urlSlug}>Link</a>
              <p>Description: {stageInfoDoc.description}</p>
            </div>
          </>
        )
      })}
    </>
  );
}