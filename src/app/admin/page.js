"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "../../hooks/socket";
import Link from "next/link";

export default function AdminPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [venueId, setVenueId] = useState(false);
  const [venuesInfo, setVenuesInfo] = useState(false);

  const updateVenuesInfo = () => {
    socket.emit("getVenuesInfo", (resp) => {
      console.log(resp);
      setVenuesInfo(resp);
    });
  };

  useEffect(() => {
    function onConnectionHandler(ev) {
      setIsConnected(true);
      updateVenuesInfo();
    }
    function onDisconnectionHandler(ev) {
      setIsConnected(false);
    }
    socket.on("connect", onConnectionHandler);
    socket.on("disconnect", onDisconnectionHandler);

    return () => {
      socket.off("connect", onConnectionHandler);
      socket.off("disconnect", onDisconnectionHandler);
    };
  }, []);

  const addVenue = async () => {
    if (!isConnected) return;
    socket.emit("createVenue", (resp) => {
      console.log(resp);
      setVenueId(resp._id);
    });
    // const url = "http://localhost:3000/api/createVenue";

    // const response = await fetch(url, {
    //     method: "POST", // *GET, POST, PUT, DELETE, etc.
    //     mode: "cors", // no-cors, *cors, same-origin
    //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //     credentials: "same-origin", // include, *same-origin, omit
    //     headers: {
    //       "Content-Type": "application/json",
    //       // 'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     redirect: "follow", // manual, *follow, error
    //     referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //     body: JSON.stringify({}), // body data type must match "Content-Type" header
    //   });

    //   let json = await response.json();
    // console.log('response:',json)
  };

  const updateVenue = (id) => {
    const newVenueInfo = {
      _id: id,
      update: {
        name: "new venue name",
      },
    };
    socket.emit("updateVenue", newVenueInfo, (resp) => {
      console.log(resp);
      updateVenuesInfo();
    });
  };

  return (
    <>
      <div>Socket Connected? {isConnected.toString()}</div>

      <button onClick={addVenue}>Add Venue</button>
      {venuesInfo &&
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
      )}
    </>
  );
}
