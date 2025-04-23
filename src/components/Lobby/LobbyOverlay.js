import { useCallback, useEffect, useState } from "react";

import { Chat } from "@/components/Chat";
import Typography from "@/components/Typography";

import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatboxOutline } from "react-icons/io5";


import styles from "./LobbyOverlay.module.scss";
import { useStageContext } from "@/components/StageContext";
import { Credits } from "@/components/Credits";

import { LobbyAnnouncement } from "@/components/LobbyAnnouncement";
import { ShowInfoPanel } from "@/components/ShowInfoPanel";

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
          maxWidth: "80%",
          height: "60%",
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

        <LobbyAnnouncement />
      </div>
    </>
  );
};
