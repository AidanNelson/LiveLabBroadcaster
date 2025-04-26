"use client";

import { useState, useEffect, createContext, useContext } from "react";

// keep track of user interactions for audio playback
function useUserInteraction() {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);

      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    if (!hasInteracted) {
      window.addEventListener("click", handleInteraction);
      window.addEventListener("keydown", handleInteraction);
      window.addEventListener("pointerdown", handleInteraction);
      window.addEventListener("touchstart", handleInteraction);
    }

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted]);

  return { hasInteracted };
}

const UserInteractionContext = createContext();

export const UserInteractionContextProvider = ({ children }) => {
  const { hasInteracted } = useUserInteraction();

  return (
    <UserInteractionContext.Provider
      value={{
        hasInteracted,
      }}
    >
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteractionContext = () => {
  return useContext(UserInteractionContext);
};
