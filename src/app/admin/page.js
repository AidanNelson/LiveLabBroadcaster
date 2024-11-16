"use client";

import { useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/components/SupabaseClient";

export default function AdminPage() {
  const { user } = useUser();
  const [name, setName] = useState("Orpheus"); // Add venueId state
  const statusRef = useRef();

  const addStage = async () => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .insert({ title: name, collaborator_ids: [user.id], url_slug: name.toLowerCase()+"-"+Date.now().toFixed(0).slice(10).toString() })
        .select();
      if (error){
        console.error("Error creating new performance:",error);
      } else {
        console.log("Successfully created new stage:",data);
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
      <button onClick={addStage}>Add Venue</button>
      <div ref={statusRef}></div>
    </>
  );
}
