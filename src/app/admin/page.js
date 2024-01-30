"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createStage } from "@/components/db";

export default function AdminPage() {
  const [venueId, setVenueId] = useState("123"); // Add venueId state

  const addVenue = () => {
    createStage({ stageId: venueId }); // Use venueId when creating stage
  }

  return (
    <>
      <input
        type="text"
        value={venueId}
        onChange={(e) => setVenueId(e.target.value)} // Update venueId state on input change
        placeholder="Venue ID"
      />
      <button onClick={addVenue}>Add Venue</button>
      {/* {venuesInfo &&
        venuesInfo.map((venue) => {
          return (
            <>
              <br />
              <button onClick={() => updateVenue(venue._id)}>
                venue {venue._id} : {venue.name}
              </button>
              <Link href={`/${venue._id}`}>Visit Venue</Link>
            </>
          );
        })}
      {venueId && (
        <div>
          <p>Updating {venueId}</p>

          <button onClick={updateVenue}>Update</button>
        </div>
      )} */}
    </>
  );
}
