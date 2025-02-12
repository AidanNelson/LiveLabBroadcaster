import { useState } from "react";

import { Chat } from "@/components/Chat";
import Typography from "@/components/Typography";

import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatboxOutline } from "react-icons/io5";
import { CgCloseR } from "react-icons/cg";

import styles from "./LobbyOverlay.module.scss";

const ShowInfoPanel = ({ isVisible, hidePanel }) => {
  const [currentInfoPanel, setCurrentInfoPanel] = useState("details");

  return (
    <>
      <div
        className={styles.infoPanel}
        style={{
          display: isVisible ? "block" : "none",
        }}
      >
        <div className={styles.content}>
          <button className={styles.closeButton} onClick={() => hidePanel()}>
            <CgCloseR />
          </button>
          <Typography variant="body1">Show Info</Typography>

          <div className={styles.infoPanelTabButtons}>
            <button onClick={() => setCurrentInfoPanel("details")}>
              <Typography
                variant="heading"
                style={{ paddingBottom: "var(--spacing-16)" }}
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
                width: "1px",
                borderLeft: "1px solid var(--ui-grey)",
                marginRight: "var(--spacing-16)",
              }}
            ></span>
            <button onClick={() => setCurrentInfoPanel("credits")}>
              <Typography
                variant="heading"
                style={{ paddingBottom: "var(--spacing-16)" }}
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
              marginTop: "var(--spacing-24)",
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
      </div>
    </>
  );
};

const ShowInfoPanelAndButton = () => {
  const [showInfoPanelOpen, setShowInfoPanelOpen] = useState(false);
  return (
    <>
      {/* show info button */}

      <button
        className={styles.bottomBarButton}
        style={{
          left: "3rem",
          display: showInfoPanelOpen ? "none" : "flex",
        }}
        onClick={() => setShowInfoPanelOpen(true)}
      >
        <Typography variant="body2">Show Info</Typography>
        <IoMdInformationCircleOutline className={styles.bottomBarButtonIcon} />
      </button>

      <ShowInfoPanel
        isVisible={showInfoPanelOpen}
        hidePanel={() => setShowInfoPanelOpen(false)}
      />
    </>
  );
};

const LobbyChat = () => {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <>
      <button
        className={styles.bottomBarButton}
        style={{
          right: "3rem",

          display: chatOpen ? "none" : "",
        }}
        onClick={() => setChatOpen(true)}
      >
        <Typography variant="body2">Chat</Typography>
        <IoChatboxOutline className={styles.bottomBarButtonIcon} />
      </button>

      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          right: "3rem",
          width: "400px",
          maxWidth: "50%",
          height: "80%",
          pointerEvents: "auto",
          display: chatOpen ? "" : "none",
        }}
      >
        <Chat closeChat={() => setChatOpen(false)} />
      </div>
    </>
  );
};
export const LobbyOverlay = () => {
  return (
    <>
      <div style={{ zIndex: 100, color: "white" }}>
        <ShowInfoPanelAndButton />
        <LobbyChat />
      </div>
    </>
  );
};
