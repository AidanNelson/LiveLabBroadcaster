import React, { createContext } from "react";

export const VenueContext = createContext();

export const VenueContextProvider = ({ venueId, children }) => {
  return (
    <VenueContext.Provider value={{ venueId }}>
      {children}
    </VenueContext.Provider>
  );
};
