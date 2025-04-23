import { useState, useEffect } from "react";
import styles from "./FlexPanel.module.scss";
import Typography from "@/components/Typography";
import { Button } from "@/components/Button";
import { AssetMangementPanel } from "@/components/Editor/AssetManagementPanel";
import { useStageContext } from "@/components/StageContext";
import { supabase } from "@/components/SupabaseClient";

const ActionsPanel = () => {
  const { stageInfo } = useStageContext();

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
          console.log("Production state changed successfully");
        }
      });
  };

  return (
    <div className={styles.actionsPanel}>
      <Typography variant="subtitle">Actions Panel</Typography>

      <Typography variant="body3">
        Current Show State:{" "}
        {stageInfo.show_state === "stage" ? "Stage" : "Lobby"}
      </Typography>
      <Button
        variant="primary"
        size="small"
        onClick={() => {
          var result = confirm("Are you sure?");
          if (result) {
            updateShowState("stage");
          }
        }}
      >
        Move All Audience to Stage
      </Button>
      <Button
        variant="primary"
        size="small"
        onClick={() => {
          var result = confirm("Are you sure?");
          if (result) {
            updateShowState("lobby");
          }
        }}
      >
        Move All Audience to Lobby
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
