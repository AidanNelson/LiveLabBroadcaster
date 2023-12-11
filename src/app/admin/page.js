"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createStage } from "@/components/db";

export default function AdminPage() {

  const addVenue = () => {
    createStage({stageId: '123'});
  }

  return (
    <>


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
