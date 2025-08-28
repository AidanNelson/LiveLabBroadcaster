import Typography from "@/components/Typography";
import styles from "./LobbyAnnouncement.module.scss";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { useStageContext } from "../StageContext";
import { useEffect, useState } from "react";

export const LobbyAnnouncement = () => {
  const { stageInfo } = useStageContext();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [announcementToShow, setAnnouncementToShow] = useState(null);



  useEffect(() => {
    const newAnnouncementToShow = stageInfo?.announcements?.find(
      (announcement) => announcement.isVisible
    ) || null;
    setIsCollapsed(!newAnnouncementToShow);
    setAnnouncementToShow(newAnnouncementToShow);
  }, [stageInfo]);

  if (!announcementToShow) return null;

  return (
    <>
      <div
        className={`${styles.lobbyHeroCard} ${
          isCollapsed ? styles.collapsed : ""
        }`}
        // style={{ display: isShown ? "flex" : "none" }}
      >
        <div className={styles.lobbyHeroCardContent}>
          <Typography variant="hero">
            {announcementToShow.title}
          </Typography>
          <Typography variant="subtitle">
            {announcementToShow.subtitle}
          </Typography>
        </div>
        <button
          className={`${styles.toggleButton} pointer-events-auto`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <IoIosArrowDown /> : <IoIosArrowUp />}
        </button>
      </div>
    </>
  );
};
