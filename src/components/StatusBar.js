"use client";

import { useUser } from "../../hooks/useUser";

export const StatusBar = () => {
  const user = useUser();

  return (
    <div className={"statusBar"}>
      <h2>Event Name</h2>
      <div className="userStatus">User Logged In? {user ? user?.username : "No"}</div>
    </div>
  );
};
