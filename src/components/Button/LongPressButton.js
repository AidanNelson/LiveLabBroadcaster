"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Button.module.scss";

const DEFAULT_HOLD_MS = 2000;

export function LongPressButton({
  disabled = false,
  variant = "primary",
  size = "large",
  onLongPressComplete,
  holdDurationMs = DEFAULT_HOLD_MS,
  children,
  className = "",
  ...rest
}) {
  const [progress, setProgress] = useState(0);
  const holdingRef = useRef(false);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const onCompleteRef = useRef(onLongPressComplete);

  useEffect(() => {
    onCompleteRef.current = onLongPressComplete;
  }, [onLongPressComplete]);

  const stopHold = useCallback(() => {
    holdingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setProgress(0);
  }, []);

  const tick = useCallback(
    (now) => {
      if (!holdingRef.current) return;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(1, elapsed / holdDurationMs);
      setProgress(p);
      if (p >= 1) {
        holdingRef.current = false;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        setProgress(0);
        onCompleteRef.current?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [holdDurationMs],
  );

  const startHold = useCallback(() => {
    if (disabled) return;
    holdingRef.current = true;
    startTimeRef.current = performance.now();
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, tick]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const classes = [
    styles.button,
    styles.longPress,
    styles[variant],
    styles[size],
    disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      {...rest}
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        e.preventDefault();
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        startHold();
      }}
      onPointerUp={(e) => {
        if (e.button !== 0) return;
        try {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {
          /* ignore */
        }
        stopHold();
      }}
      onPointerCancel={stopHold}
      onLostPointerCapture={stopHold}
      onPointerLeave={(e) => {
        if (e.buttons === 0) return;
        stopHold();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span
        className={styles.longPressProgress}
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
      <span className={styles.longPressContent}>{children}</span>
    </button>
  );
}
