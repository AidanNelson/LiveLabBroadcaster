import styles from "./Button.module.scss";

export const Button = ({
  disabled = false,
  variant = "primary",
  size = "large",
  onClick,
  children,
}) => {

  const classes = `${styles.button} ${styles[`${variant}`]} ${
    styles[`${size}`]
  } ${disabled ? styles.disabled : ""}`;

  return <button className={classes} onClick={onClick}>{children}</button>;
};
export const ToggleButton = ({
  disabled = false,
  variant = "primary",
  size = "large",
  onClick,
  children,
  toggleActive = false,
}) => {

  const classes = `${styles.button} ${styles[`${variant}`]} ${
    styles[`${size}`]
  } ${disabled ? styles.disabled : ""} ${toggleActive ? styles.toggleActive : styles.toggleInactive
  }`;


  return <button className={classes} onClick={onClick}>{children}</button>;
};