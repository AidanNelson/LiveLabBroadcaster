import styles from "./ToggleSwitch.module.css";

export const ToggleSwitch = ({ isChecked, setIsChecked }) => {
  return (
    <label class={styles.switch}>
      <input type="checkbox" checked={isChecked} onChange={setIsChecked} />
      <span className={styles.slider}></span>
    </label>
  );
};
