import { useState, useEffect } from "react";
import styles from "./FlexPanel.module.scss";
import Typography from "@/components/Typography";
import { Button, ToggleButton } from "@/components/Button";
import { AssetMangementPanel } from "@/components/Editor/AssetManagementPanel";
import { useStageContext } from "@/components/StageContext";
import { supabase } from "@/components/SupabaseClient";

import debug from "debug";
const logger = debug("broadcaster:flexPanel");

const ActionsPanel = () => {
  const { stageInfo } = useStageContext();

  const toggleLobbyWebcamMicrophoneAvailable = () => {
    supabase
      .from("stages")
      .update({
        lobby_webcam_microphone_available: stageInfo?.lobby_webcam_microphone_available ? false : true,
      })
      .eq("id", stageInfo.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error changing lobby webcam/microphone state:", error);
        } else {
          logger("Lobby webcam/microphone state changed successfully");
        }
      });
  };

  const toggleChatState = () => {
    supabase
      .from("stages")
      .update({
        chat_active: stageInfo?.chat_active ? false : true,
      })
      .eq("id", stageInfo.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error changing chat state:", error);
        } else {
          logger("Production chat state changed successfully");
        }
      });
  };

  const updateShowState = (newState) => {
    supabase
      .from("stages")
      .update({
        show_state: newState,
      })
      .eq("id", stageInfo.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error changing production state:", error);
        } else {
          logger("Production state changed successfully");
        }
      });
  };


  const deleteChatMessagesForStage = () => {
    supabase
      .from("chat_messages")
      .delete()
      .eq("stage_id", stageInfo.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error deleting chat messages:", error);
        } else {
          logger("Chat messages deleted successfully");
        }
      });
  };

  return (
    <div className={`flex flex-wrap gap-4`}>
      <Button
        variant="primary"
        size="small"
        onClick={() => {
          var result = confirm("Are you sure?");
          if (result) {
            let nextState =
              stageInfo.show_state === "stage" ? "lobby" : "stage";
            updateShowState(nextState);
          }
        }}
      >
        Move All Audience to{" "}
        {stageInfo.show_state === "stage" ? "Lobby" : "Stage"}
      </Button>

      <ToggleButton
        variant="primary"
        size="small"
        toggleActive={stageInfo?.chat_active}
        onClick={() => {
          var result = confirm(
            `This will turn chat ${
              stageInfo?.chat_active ? "off" : "on"
            } in the lobby and stage.  Are you sure?`,
          );
          if (result) {
            toggleChatState();
          }
        }}
      >
        Turn Chat {stageInfo?.chat_active ? `off` : `on`}
      </ToggleButton>

      <ToggleButton
        variant="primary"
        size="small"
        toggleActive={stageInfo?.lobby_webcam_microphone_available}
        onClick={() => {
          var result = confirm(
            `This will turn turn the webcam and microphone option ${
              stageInfo?.lobby_webcam_microphone_available ? "off" : "on"
            } in the lobby.  Are you sure?`,
          );
          if (result) {
            toggleLobbyWebcamMicrophoneAvailable();
          }
        }}
      >
        Turn Lobby Webcam / Microphone {stageInfo?.lobby_webcam_microphone_available ? `off` : `on`}
      </ToggleButton>

      <Button
        variant="primary"
        size="small"
        onClick={() => {
          var result = confirm("Are you sure?");
          if (result) {
            deleteChatMessagesForStage();
          }
        }}
      >
        Delete Chat Messages
      </Button>
    </div>
  );
};

export const FlexPanel = () => {
  const [currentPage, setCurrentPage] = useState("assets");

  return (
    <div className={styles.flexPanelContainer}>
      <div className={styles.tabsContainer}>
        <div
          className={`${styles.tab} ${
            currentPage === "assets" ? styles.active : ""
          }`}
        >
          <button onClick={() => setCurrentPage("assets")}>
            <Typography variant="body3">Assets</Typography>
          </button>
        </div>
        <div
          className={`${styles.tab} ${
            currentPage === "actions" ? styles.active : ""
          }`}
        >
          <button onClick={() => setCurrentPage("actions")}>
            <Typography variant="body3">Actions</Typography>
          </button>
        </div>
      </div>
      <div className={styles.contentContainer}>
        {currentPage === "assets" && (
          <>
            <AssetMangementPanel />
          </>
        )}
        {currentPage === "actions" && (
          <>
            <ActionsPanel />
          </>
        )}
      </div>
    </div>
  );
};
