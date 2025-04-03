import {useState, useEffect} from "react";
import {ResizablePanel} from "@/components/ResizablePanel";


export const ThreePanelLayout = ({ left, rightTop, rightBottom }) => {
  const [navBarHeight, setNavBarHeight] = useState(() => {
    return document.getElementById("navBar")?.offsetHeight || 75;
  });
  const [panelWidth, setPanelWidth] = useState(() => {
    const savedPanelWidth = Number(localStorage.getItem("panelWidth"));
    const startingWidth = savedPanelWidth
      ? savedPanelWidth
      : window.innerWidth / 2;
    return startingWidth;
  }); // Initial width of the panel

  const [panelHeight, setPanelHeight] = useState(() => {
    const savedPanelHeight = Number(localStorage.getItem("panelHeight"));
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
          >
            {left}
          </ResizablePanel>

          <div
            style={{
              width: `calc(100vw - ${panelWidth}px)`,
              position: "relative",
            }}
          >
            <div
              style={{
                height: `calc(100vh - ${panelHeight}px - ${navBarHeight}px)`,
                position: "relative",
              }}
            >
              {rightTop}
            </div>
            <ResizablePanel
              panelSize={panelHeight}
              setPanelSize={setPanelHeight}
              resizeDirection="vertical"
              style={{
                position: "relative",
              }}
            >
              {rightBottom}
            </ResizablePanel>
          </div>
        </div>
      </>
    </>
  );
};
