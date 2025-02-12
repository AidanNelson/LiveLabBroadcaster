import styles from "./button.module.scss";

export const Button = ({
  disabled = false,
  variant = "primary",
  size = "large",
  onClick,
  children,
}) => {
  console.log(styles);

  const classes = `${styles.button} ${styles[`${variant}`]} ${
    styles[`${size}`]
  } ${disabled ? styles.disabled : ""}`;

  return <button className={classes} onClick={onClick}>{children}</button>;
};
