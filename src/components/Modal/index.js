import styles from "./Modal.module.css";

export const Modal = ({ children }) => {
  return (
    <div class={styles.modalOverlay}>
      <div class={styles.modalContent}>
        {children}
      </div>
    </div>
  );
};
