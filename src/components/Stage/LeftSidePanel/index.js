import styles from "./LeftSidePanel.module.scss";
import { CgCloseR } from "react-icons/cg";

export const LeftSidePanel = ({
  isVisible,
  hidePanel,
  bottom,
  left,
  height,
  children,
}) => {
  return (
    <>
      <div
        className={styles.leftSidePanel}
        style={{
          display: isVisible ? "block" : "none",
          bottom: bottom ? bottom : "3rem",
          left: left ? left : "3rem",
          ...(height ? { height } : {}),
        }}
      >
        <div className={styles.content}>
          <button className={styles.closeButton} onClick={() => hidePanel()}>
            <CgCloseR />
          </button>
          {children}
        </div>
      </div>
    </>
  );
};
