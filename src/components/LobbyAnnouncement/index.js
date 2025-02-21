import Typography from "@/components/Typography";
import styles from "./LobbyAnnouncement.module.scss";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { useStageContext } from "../StageContext";
import { useEffect, useState } from "react";

export const LobbyAnnouncement = () => {
  const { stageInfo } = useStageContext();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    console.log(stageInfo.lobby_announcement.isVisible);
    setIsShown(stageInfo.lobby_announcement.isVisible);
    if (stageInfo.lobby_announcement.isVisible) {
      setIsCollapsed(false);
      console.log('setting not collapsed');
    }
  }, [stageInfo]);

  useEffect(() => {
    console.log('collapsed: ', isCollapsed);
  },[isCollapsed]);

  return (
    <>
      <div
        className={`${styles.lobbyHeroCard} ${
          isCollapsed ? styles.collapsed: ""
        }`}
        style={{ display: isShown ? "flex" : "none" }}
      >
        <div className={styles.lobbyHeroCardContent}>
          <Typography variant="hero">
            {stageInfo.lobby_announcement.currentAnnouncement.title}
          </Typography>
          <Typography variant="subtitle">
            {stageInfo.lobby_announcement.currentAnnouncement.subtitle}
          </Typography>
        </div>
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <IoIosArrowDown /> :  <IoIosArrowUp />}
        </button>
      </div>
    </>
  );
};
