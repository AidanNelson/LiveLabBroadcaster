import Typography from "@/components/Typography";
import styles from "./LobbyHeroCard.module.scss";
import { CgCloseR } from "react-icons/cg";
import { IoIosArrowDown } from "react-icons/io";

export const LobbyHeroCard = ({ isShown, setIsShown }) => {
  return (
    <>
      <div
        className={`${styles.lobbyHeroCard} ${isShown ? "" : styles.collapsed}`}
        // style={{ display: `${isShown ? "flex" : "none"}` }}
      >
        <button
          className={styles.closeButton}
          onClick={() => setIsShown(false)}
        >
          <CgCloseR />
        </button>
        <div className={styles.lobbyHeroCardContent}>
          <Typography variant="hero">The Show is about to start</Typography>
          <Typography variant="subtitle">
            Grab any refreshments, get comfortable, and if possible, turn off
            notifications on your device to minimize distractions.
          </Typography>
        </div>
        <button className={styles.openButton} style={{display: isShown ? "none": ""}} onClick={() => setIsShown(true)}>
          <IoIosArrowDown />
        </button>
      </div>
    </>
  );
};
