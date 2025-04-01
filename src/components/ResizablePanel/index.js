import { useEffect, useState, useRef } from "react";
import styles from "./ResizablePanel.module.css";
import { set } from "lodash";

export const ResizablePanel = ({
  panelSize,
  setPanelSize,
  children,
  resizeDirection = "vertical",
}) => {
  const handleRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState(null);
  const [initialPanelSize, setInitialPanelSize] = useState(panelSize);

  useEffect(() => {
    if (!handleRef.current) return;

    const onMouseDown = (e) => {
      setIsDragging(true);
      setInitialPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    const onMouseUp = () => {
      setIsDragging(false);
      setInitialPosition(null);
      setInitialPanelSize(panelSize);
    };

    const onMouseMove = (e) => {
      if (!isDragging || !initialPosition || !handleRef.current) return;

      let deltaX = e.clientX - initialPosition.x;
      let deltaY = e.clientY - initialPosition.y;

      const newSize =
        resizeDirection === "horizontal"
          ? initialPanelSize + deltaX
          : initialPanelSize - deltaY;

      setPanelSize(newSize);
      // if (resizeDirection === "horizontal") {
      //   const newWidth = e.clientX; // Adjust for left handle drag
      //   if (newWidth >= 200 && newWidth <= 700) {
      //     // Boundary checks
      //     setPanelSize(newWidth);
      //   }
      //   return;
      // }
      // const newHeight = window.innerHeight - e.clientY; // Adjust for top handle drag
      // if (newHeight >= 200 && newHeight <= 500) {
      //   // Boundary checks
      //   setPanelSize(newHeight);
      // }
    };
    handleRef.current.addEventListener("pointerdown", onMouseDown);
    document.addEventListener("pointerup", onMouseUp);
    document.addEventListener("pointermove", onMouseMove);

    return () => {
      document.removeEventListener("pointerup", onMouseUp);
      document.removeEventListener("pointermove", onMouseMove);
      if (!handleRef.current) return;
      handleRef.current.removeEventListener("pointerdown", onMouseDown);
    };
    // (e) => {
    // document.addEventListener("mousemove", handleDrag);
    // document.addEventListener(
    //   "mouseup",
    //   () => {
    //     document.removeEventListener("mousemove", handleDrag);
    //   },
    //   { once: true },
    // );
  }, [panelSize, setPanelSize, isDragging, initialPosition]);

  return (
    <div
      className={`${styles.resizablePanel} ${
        resizeDirection === "horizontal" ? styles.horizontal : ""
      }`}
      style={
        resizeDirection === "vertical"
          ? { height: `${panelSize}px`, position: "relative" }
          : { width: `${panelSize}px`, position: "relative" }
      }
    >
      <div
        ref={handleRef}
        className={`${styles.resizeHandle} ${
          resizeDirection === "horizontal" ? styles.resizeHandleHorizontal : styles.resizeHandleVertical
        }`}
      />
      <div className={styles.panelContent}>{children}</div>
    </div>
  );
};
