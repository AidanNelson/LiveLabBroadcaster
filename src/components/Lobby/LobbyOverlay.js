import { useEffect, useState } from "react";

import { Chat } from "@/components/Chat";
import Typography from "@/components/Typography";

import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatboxOutline } from "react-icons/io5";

import styles from "./LobbyOverlay.module.scss";

import { LobbyAnnouncement } from "@/components/LobbyAnnouncement";
import { ShowInfoPanel } from "@/components/ShowInfoPanel";

import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";
import { CiMicrophoneOn } from "react-icons/ci";
import { CiMicrophoneOff } from "react-icons/ci";
import { CiSettings } from "react-icons/ci";
import { useUserMediaContext } from "@/components/UserMediaContext";
import { MediaPicker, AvatarPreview } from "../AudienceOnboarding";
import { useStageContext } from "../StageContext";

const ShowInfoPanelAndButton = ({
  showInfoPanelOpen,
  setShowInfoPanelOpen,
  infoButtonVisible,
}) => {
  return (
    <>
      {/* show info button */}

      <button
        className={`pointer-events-auto ${styles.bottomBarButton}`}
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
        className={`pointer-events-auto ${styles.bottomBarButton}`}
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

const UserMediaSettingsModal = ({ setSettingsModalOpen }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        maxWidth: "90%",
        // height: "400px",
        maxHeight: "90%",
        backgroundColor: "black",
        border: "1px solid white",
        borderRadius: "8px",
        display: "flex",
        margin: "8px",
        flexDirection: "column",
        padding: "32px",
        pointerEvents: "auto",
      }}
    >
      <button
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          marginLeft: "auto",
          fontSize: "24px",
        }}
        onClick={() => setSettingsModalOpen(false)}
      >
        X
      </button>
      {/* <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      > */}
      {/* <div style={{ width: "50%" }}> */}
      <MediaPicker />
      {/* </div> */}
      {/* <div style={{ width: "50%" }}>
          <AvatarPreview />
        </div> */}
      {/* </div> */}
    </div>
  );
};

const UserMediaControls = () => {
  const {
    cameraEnabled,
    toggleCameraEnabled,
    microphoneEnabled,
    toggleMicrophoneEnabled,
  } = useUserMediaContext();

  const { stageInfo } = useStageContext();

  useEffect(() => {
    if (!stageInfo.lobby_webcam_microphone_available) {
      setSettingsModalOpen(false);
      toggleCameraEnabled(false);
      toggleMicrophoneEnabled(false);
    }
  }, [stageInfo.lobby_webcam_microphone_available]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  return (
    <>
      {settingsModalOpen && (
        <UserMediaSettingsModal setSettingsModalOpen={setSettingsModalOpen} />
      )}
      <div
        style={{
          visibility: stageInfo.lobby_webcam_microphone_available ? "visible" : "hidden",
          position: "absolute",
          bottom: "3rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100px",
          maxWidth: "100%",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "row",
          zIndex: 10,
        }}
      >
        <button
          className={styles.iconButton}
          onClick={() => toggleCameraEnabled()}
        >
          {cameraEnabled ? <CiVideoOn /> : <CiVideoOff />}
        </button>
        <button
          className={styles.iconButton}
          onClick={() => {
            setSettingsModalOpen(true);
          }}
        >
          <CiSettings />
        </button>
        <button
          className={styles.iconButton}
          onClick={() => toggleMicrophoneEnabled()}
        >
          {microphoneEnabled ? <CiMicrophoneOn /> : <CiMicrophoneOff />}
        </button>
      </div>
    </>
  );
};
export const LobbyOverlay = () => {
  const { stageInfo } = useStageContext();
  const [chatOpen, setChatOpen] = useState(false);
  const [showInfoPanelOpen, setShowInfoPanelOpen] = useState(false);

  const [chatButtonVisible, setChatButtonVisible] = useState(true);
  const [infoButtonVisible, setInfoButtonVisible] = useState(true);

  const setChatVisibility = (open) => {
    setChatOpen(open);

    if (window.innerWidth < 1000 && open) {
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
      setChatButtonVisible(false);
      setChatOpen(false);
    }
    if (!open) {
      setChatButtonVisible(true);
    }
  };

  return (
    <>
      <div
        className={`z-10 absolute top-0 left-0 w-full h-full pointer-events-none`}
      >
        <ShowInfoPanelAndButton
          infoButtonVisible={infoButtonVisible}
          showInfoPanelOpen={showInfoPanelOpen}
          setShowInfoPanelOpen={setInfoPanelVisibility}
        />
       <UserMediaControls />
        {stageInfo?.chat_active && (
          <LobbyChat
            chatButtonVisible={chatButtonVisible}
            chatOpen={chatOpen}
            setChatOpen={setChatVisibility}
          />
        )}

        <LobbyAnnouncement />
      </div>
    </>
  );
};
