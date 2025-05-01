import { useState, useEffect } from "react";
import { ResizablePanel } from "@/components/ResizablePanel";
import { CiMaximize1 } from "react-icons/ci";
import { CiMinimize1 } from "react-icons/ci";
import { IconButton } from "../Button";
import { useNavBarHeightContext } from "../NavBar/NavBarAndNavBarHeightContextProvider";

export const ThreePanelLayout = ({ left, rightTop, rightBottom }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const { navBarHeight } = useNavBarHeightContext();

  const [panelWidth, setPanelWidth] = useState(() => {
    const savedPanelWidth = Math.max(
      200,
      Number(localStorage.getItem("panelWidth")),
    );
    const startingWidth = savedPanelWidth
      ? savedPanelWidth
      : window.innerWidth / 2;
    return startingWidth;
  }); // Initial width of the panel

  const [panelHeight, setPanelHeight] = useState(() => {
    const savedPanelHeight = Math.max(
      200,
      Number(localStorage.getItem("panelHeight")),
    );
    const startingHeight = savedPanelHeight
      ? savedPanelHeight
      : window.innerHeight / 2;
    return startingHeight;
  }); // Initial height of the panel

  useEffect(() => {
    localStorage.setItem("panelWidth", panelWidth);
  }, [panelWidth]);

  useEffect(() => {
    localStorage.setItem("panelHeight", panelHeight);
  }, [panelHeight]);

  return (
    <>
      <>
        <div
          style={{
            width: "100vw",
            height: "calc(100vh - " + navBarHeight + "px)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ResizablePanel
            panelSize={panelWidth}
            setPanelSize={setPanelWidth}
            resizeDirection="horizontal"
            style={{ display: isMaximized ? "none" : "" }}
          >
            {left}
          </ResizablePanel>

          <div
            style={{
              width: "100vw", 
              ...(isMaximized? {}: { width: `calc(100vw - ${panelWidth}px)` }),
              position: "relative",
            }}
          >
            <div
              style={{
                height: `calc(100vh - ${navBarHeight}px)`,
                position: "relative",
                ...(isMaximized
                  ? {} // No additional height adjustments when maximized
                  : { height: `calc(100vh - ${panelHeight}px - ${navBarHeight}px)` }),
              }}
            >
              {rightTop}
              <div style={{ position: "absolute", top: "24px", right: "24px" }}>
                <IconButton
                  onClick={() => {
                    setIsMaximized((prev) => !prev);
                  }}
                >
                  {isMaximized ? <CiMinimize1 /> : <CiMaximize1 />}
                </IconButton>
              </div>
            </div>
            <ResizablePanel
              panelSize={panelHeight}
              setPanelSize={setPanelHeight}
              resizeDirection="vertical"
              style={{ display: isMaximized ? "none" : "" }}
            >
              {rightBottom}
            </ResizablePanel>
          </div>
        </div>
      </>
    </>
  );
};
