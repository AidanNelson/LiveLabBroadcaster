"use client";

import { useRealtimeContext } from "@/components/RealtimeContext";
import styles from "./BroadcastCaptionOverlay.module.scss";

/**
 * Audience: bottom overlay on the broadcast video when caption data has arrived.
 */
export function BroadcastCaptionOverlay() {
  const { broadcastCaptionText } = useRealtimeContext();

  if (!broadcastCaptionText?.trim()) return null;

  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className={styles.inner}>{broadcastCaptionText}</div>
    </div>
  );
}
