import { useState } from "react";

import Typography from "@/components/Typography";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { CgCloseR } from "react-icons/cg";

export const LobbyOverlay = () => {
  const [showInfoPanelOpen, setShowInfoPanelOpen] = useState(false);
  const [currentInfoPanel, setCurrentInfoPanel] = useState("details");
  return (
    <>
      <div style={{ zIndex: 100, color: "white" }}>
        {/* show info button */}
        {!showInfoPanelOpen && (
          <button
            className={"buttonSmall"}
            style={{
              border: "1px solid white",
              background: "var(--overlay-light-color)",
              bottom: "3rem",
              left: "50px",
              position: "absolute",
            }}
            onClick={() => setShowInfoPanelOpen(true)}
          >
            <Typography variant="body1">Show Info</Typography>
            <IoMdInformationCircleOutline
              style={{
                marginLeft: "5px",
                width: "1.5rem",
                height: "1.5rem",
              }}
            />
          </button>
        )}
        {showInfoPanelOpen && (
          <div
            style={{
              border: "1px solid white",
              background: "var(--overlay-light-color)",
              bottom: "3rem",
              width: "400px",
              height: "500px",
              left: "50px",
              position: "absolute",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body1">Show Info</Typography>
              <button
                className={"buttonIcon"}
                style={{ color: "white" }}
                onClick={() => setShowInfoPanelOpen(false)}
              >
                <CgCloseR
                  style={{ fill: "white", width: "2rem", height: "2rem" }}
                />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <button
                className={"buttonIcon"}
                style={{
                  color: "white",
                  width: "50%",
                  textAlign: "start",
                }}
                onClick={() => setCurrentInfoPanel("details")}
              >
                <Typography
                  variant="heading"
                  style={{ paddingTop: "0.5rem", paddingBottom: "1rem" }}
                >
                  Details
                </Typography>
                <div
                  style={{
                    width: "80%",
                    height: "1px",
                    borderBottom:
                      currentInfoPanel === "details"
                        ? "0.5px solid var(--ui-light-grey)"
                        : "none",
                  }}
                ></div>
              </button>
              <span
                style={{
                  width: "10px",
                  borderLeft: "1px solid var(--ui-grey)",
                }}
              ></span>
              <button
                className={"buttonIcon"}
                style={{
                  color: "white",
                  width: "50%",
                  textAlign: "start",
                }}
                onClick={() => setCurrentInfoPanel("credits")}
              >
                <Typography
                  variant="heading"
                  style={{ paddingTop: "0.5rem", paddingBottom: "1rem" }}
                >
                  Credits
                </Typography>
                <div
                  style={{
                    width: "80%",
                    height: "1px",
                    borderBottom:
                      currentInfoPanel === "credits"
                        ? "0.5px solid var(--ui-light-grey)"
                        : "none",
                  }}
                ></div>
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              {currentInfoPanel === "details" && (
                <Typography
                  variant="body1"
                  style={{ color: "var(--text-secondary-color)" }}
                >
                  Details
                </Typography>
              )}
              {currentInfoPanel === "credits" && (
                <Typography
                  variant="body1"
                  style={{ color: "var(--text-secondary-color)" }}
                >
                  Credits
                </Typography>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
