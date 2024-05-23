import { useEffect, useState, useRef } from "react";
import styles from "./Dropdown.module.css";

export const Dropdown = ({ children }) => {
  const [show, setShow] = useState(false);
  const dropdownContentRef = useRef();

  useEffect(() => {
    // deal with clicking outside of the dropdown
    const onClick = (event) => {
      if (dropdownContentRef.current) {
        if (!dropdownContentRef.current.contains(event.target)) {
          setShow(false);
        }
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  });
  return (
    <div class={styles.dropdown}>
      <span onClick={() => setShow(!show)}>&lt;</span>
      {show && (
        <div ref={dropdownContentRef} class={styles.dropdownContent}>
          {children}
        </div>
      )}
    </div>
  );
};
