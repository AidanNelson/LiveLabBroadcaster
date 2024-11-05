"use client";

import { useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/components/SupabaseClient";

export default function AdminPage() {
  const user = useUser();
  const [name, setName] = useState("Orpheus"); // Add venueId state
  const statusRef = useRef();

  const addVenue = async () => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .insert({ title: name, collaborator_ids: [user.id], url_slug: name+"-"+Date.now().toFixed(0).slice(10).toString() })
        .select();
      if (error){
        console.error("Error creating new performance:",error);
      } else {
        console.log("Successfully created new stage:",data);
      }
      // const url =
      //   process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS ||
      //   "http://localhost:3030";
      // const res = await fetch(url + `/stage/create`, {
      //   method: "POST",
      //   credentials: "include",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name }),
      // });
      // if (res.status === 200) {
      //   let info = await res.json();
      //   statusRef.current.innerHTML = `Stage created with id: ${info.id}`;
      //   console.log("Stage created with id:", info.id);
      // } else {
      //   statusRef.current.innerHTML = "Failed to create stage";
      //   console.error("Failed to create stage");
      // }
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
    </>
  );
}
