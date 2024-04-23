// resize hook for making draggable-resizeable drawer per
// https://stackoverflow.com/questions/49469834/recommended-way-to-have-drawer-resizable

import { setIn } from "formik";
import { useCallback, useEffect, useState } from "react";

export const useResize = ({
  initialWidth = 400,
  initialHeight = 400,
  minWidth = 0,
  minHeight = 0,
  maxWidth = Infinity,
  maxHeight = Infinity,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const [initialClientX, setInitialClientX] = useState(null);
  const [initialClientY, setInitialClientY] = useState(null);

  const enableResize = useCallback(
    (e) => {
      setInitialClientX(e.clientX);
      setInitialClientY(e.clientY);
      setIsResizing(true);
    },
    [setIsResizing],
  );

  const disableResize = useCallback(() => {
    setInitialClientX(null);
    setInitialClientY(null);
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback(
    (e) => {
      if (isResizing) {

        // width updates
        if (initialClientX) {
          const newClientX = e.clientX;
          const change = initialClientX - newClientX;

          const newWidth = width - change; // You may want to add some offset here from props

          if (newWidth >= minWidth && newWidth <= maxWidth) {
            setWidth(newWidth);
          }
        }

        // height updates
        if (initialClientY) {
          const newClientY = e.clientY;
          const change = initialClientY - newClientY;

          const newHeight = height + change; // You may want to add some offset here from props

          if (newHeight >= minHeight && newHeight <= maxHeight) {
            setHeight(newHeight);
          }
        }
      }
    },
    [
      minWidth,
      minHeight,
      setHeight,
      isResizing,
      setWidth,
      initialClientX,
      initialClientY,
    ],
  );

  useEffect(() => {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", disableResize);

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", disableResize);
    };
  }, [disableResize, resize]);

  return { width, height, enableResize };
};
