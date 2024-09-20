"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Edit } from "@mui/icons-material";

const StageInfoCard = ({ stageInfo }) => {
  console.log(stageInfo);

  const [localStageInfo, setLocalStageInfo] = useState(stageInfo);

  useEffect(() => {
    console.log({ localStageInfo });
  }, [localStageInfo]);

  const updateStageInfo = async () => {
    console.log("updating stage info...");

    console.log("Sending update to server: ", stageInfo.id);
    const url =
      process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ||
      "http://localhost:3030";
    const res = await fetch(url + `/stage/${stageInfo.id}/update`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ update: localStageInfo }),
    });
    console.log(res);
    console.log("update feature response?", res);
  };
  return (
    <div className="stageInfoCardContainer">
      <button onClick={updateStageInfo}>SAVE to DB</button>
      <div>
        <label>Stage Name:</label>
        <input
          value={localStageInfo.name}
          onChange={(ev) => {
            setLocalStageInfo((prev) => ({ ...prev, name: ev.target.value }));
          }}
        ></input>
      </div>
      <div>
        <label>URL Slug:</label>
        <input
          value={localStageInfo.urlSlug}
          onChange={(ev) => {
            setLocalStageInfo((prev) => ({
              ...prev,
              urlSlug: ev.target.value,
            }));
          }}
        ></input>
      </div>
      <div>
        <label>Description:</label>
        <input
          value={localStageInfo.description}
          onChange={(ev) => {
            setLocalStageInfo((prev) => ({
              ...prev,
              description: ev.target.value,
            }));
          }}
        ></input>
      </div>

      <a href={"/stage/" + stageInfo.urlSlug}>Link</a>
      <p>Description: {stageInfo.description}</p>
    </div>
  );
};

export default function AdminPage() {
  const user = useUser({ redirectTo: "/login" });
  const [name, setName] = useState("Orpheus"); // Add venueId state
  const statusRef = useRef();
  const [stagesInfo, setStagesInfo] = useState([]);
  const updateStageName = async (newName) => {
    console.log(newName);
  };

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
  };

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

      {stagesInfo.map((stageInfo) => (
        <StageInfoCard stageInfo={stageInfo} />
      ))}
    </>
  );
}
