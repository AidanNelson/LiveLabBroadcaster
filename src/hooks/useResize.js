// resize hook for making draggable-resizeable drawer per
// https://stackoverflow.com/questions/49469834/recommended-way-to-have-drawer-resizable

import { useCallback, useEffect, useState } from "react";

export const useResize = ({ minWidth }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(minWidth);

  const enableResize = useCallback(() => {
    console.log("enabling resizing");
    setIsResizing(true);
  }, [setIsResizing]);

  const disableResize = useCallback(() => {
    console.log("disabling resizing");
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback(
    (e) => {
      if (isResizing) {
        console.log("resizing");
        const newWidth = e.clientX; // You may want to add some offset here from props
        if (newWidth >= minWidth) {
          setWidth(newWidth);
        }
      }
    },
    [minWidth, isResizing, setWidth],
  );

  useEffect(() => {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", disableResize);

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", disableResize);
    };
  }, [disableResize, resize]);

  useEffect(() => {
    console.log("width:", width);
  });

  return { width, enableResize };
};
