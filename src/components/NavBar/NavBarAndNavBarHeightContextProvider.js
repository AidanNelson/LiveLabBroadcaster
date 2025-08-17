"use client";
import { NavBar} from "./index.js";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const NavBarHeightContext = createContext(75); // Default to 75 if nothing provided

export function NavBarAndNavBarHeightContextProvider({ children }) {
  const navBarRef = useRef(null);
  const [navBarHeight, setNavBarHeight] = useState(75);

  useEffect(() => {
    if (navBarRef.current) {
        setNavBarHeight(navBarRef.current.offsetHeight);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (navBarRef.current) {
        setNavBarHeight(navBarRef.current.offsetHeight);
      }
    });

    if (navBarRef.current) {
      resizeObserver.observe(navBarRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <NavBarHeightContext.Provider value={{navBarHeight}}>
      <NavBar ref={navBarRef} isStageManagementPage={true} />
      {children}
    </NavBarHeightContext.Provider>
  );
}

export function useNavBarHeightContext() {
  return useContext(NavBarHeightContext);
}
