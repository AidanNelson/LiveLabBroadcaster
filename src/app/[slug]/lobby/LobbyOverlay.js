import { useCallback, useEffect, useState } from "react";

import { Chat } from "@/components/Chat";
import Typography from "@/components/Typography";

import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatboxOutline } from "react-icons/io5";
import { CgCloseR } from "react-icons/cg";

import styles from "./LobbyOverlay.module.scss";
import { useStageContext } from "@/components/StageContext";
import { Credits } from "@/components/Credits";

const ShowInfoPanel = ({ isVisible, hidePanel }) => {
  const [currentInfoPanel, setCurrentInfoPanel] = useState("details");
  const { stageInfo } = useStageContext();

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
              overflowY: "auto",
              paddingBottom: "4rem",
            }}
          >
            {currentInfoPanel === "details" && (
              <Typography
                variant="body1"
                style={{ color: "var(--text-secondary-color)", whiteSpace: "pre-line" }}
              >
                {stageInfo.description}
              </Typography>
            )}
            {currentInfoPanel === "credits" && (
              <Credits credits={stageInfo.credits} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const ShowInfoPanelAndButton = ({
  showInfoPanelOpen,
  setShowInfoPanelOpen,
  infoButtonVisible,
}) => {
  return (
    <>
      {/* show info button */}

      <button
        className={styles.bottomBarButton}
        style={{
          left: "3rem",
          display: showInfoPanelOpen || !infoButtonVisible ? "none" : "flex",
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

const LobbyChat = ({ chatOpen, setChatOpen, chatButtonVisible }) => {
  return (
    <>
      <button
        className={styles.bottomBarButton}
        style={{
          right: "3rem",

          display: chatOpen || !chatButtonVisible ? "none" : "",
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
  const [chatOpen, setChatOpen] = useState(false);
  const [showInfoPanelOpen, setShowInfoPanelOpen] = useState(false);

  const [chatButtonVisible, setChatButtonVisible] = useState(true);
  const [infoButtonVisible, setInfoButtonVisible] = useState(true);

  const setChatVisibility = (open) => {
    setChatOpen(open);

    if (window.innerWidth < 1000 && open) {
      console.log("hiding info button");
      setInfoButtonVisible(false);
      setShowInfoPanelOpen(false);
    }
    if (!open) {
      setInfoButtonVisible(true);
    }
  };

  const setInfoPanelVisibility = (open) => {
    setShowInfoPanelOpen(open);
    if (window.innerWidth < 1000 && open) {
      console.log("hiding chat button");
      setChatButtonVisible(false);
      setChatOpen(false);
    }
    if (!open) {
      setChatButtonVisible(true);
    }
  };

  useEffect(() => {
    console.log({ chatButtonVisible, infoButtonVisible });
  }, [chatButtonVisible, infoButtonVisible]);

  // const open
  // useEffect(() => {
  //   let currentWindowWidth = window.innerWidth;
  //   if (currentWindowWidth < 1000){
  //     if ()
  //   }
  // },[chatOpen, showInfoPanelOpen]);
  return (
    <>
      <div style={{ zIndex: 100, color: "white" }}>
        <ShowInfoPanelAndButton
          infoButtonVisible={infoButtonVisible}
          showInfoPanelOpen={showInfoPanelOpen}
          setShowInfoPanelOpen={setInfoPanelVisibility}
        />
        <LobbyChat
          chatButtonVisible={chatButtonVisible}
          chatOpen={chatOpen}
          setChatOpen={setChatVisibility}
        />
      </div>
    </>
  );
};
