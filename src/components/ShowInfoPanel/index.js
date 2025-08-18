import Typography from "@/components/Typography";
import styles from "./ShowInfoPanel.module.scss";
import { useState } from "react";
import { useStageContext } from "../StageContext";
import { CgCloseR } from "react-icons/cg";
import { InfoPanelCredits } from "@/components/Credits";

export const ShowInfoPanel = ({ isVisible, hidePanel, bottom, left }) => {
  const [currentInfoPanel, setCurrentInfoPanel] = useState("details");
  const { stageInfo } = useStageContext();

  return (
    <>
      <div
        className={styles.infoPanel}
        style={{
          display: isVisible ? "block" : "none",
          bottom: bottom ? bottom : "3rem",
          left: left ? left : "3rem",
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
                style={{
                  color: "var(--text-secondary-color)",
                  whiteSpace: "pre-line",
                }}
              >
                {stageInfo?.description}
              </Typography>
            )}
            {currentInfoPanel === "credits" && (
              <InfoPanelCredits credits={stageInfo?.credits} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
