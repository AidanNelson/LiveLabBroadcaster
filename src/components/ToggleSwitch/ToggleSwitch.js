import styles from "./ToggleSwitch.module.css";

export const ToggleSwitch = ({isChecked, setIsChecked}) => {
  return (
    <label class={styles.switch}>
      <input type="checkbox" checked={isChecked} onClick={setIsChecked}/>
      <span class={styles.slider}></span>
    </label>
  );
};
