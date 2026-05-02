/**
 * Wait until getUserMedia tracks are safe to hand to WebRTC (e.g. LiveKit publish).
 * Used after device switches and immediately before publish.
 */

async function waitForFirstVideoFrame(track, timeoutMs) {
  const video = document.createElement("video");
  video.muted = true;
  video.setAttribute("playsinline", "");
  video.playsInline = true;
  video.srcObject = new MediaStream([track]);

  try {
    await video.play();
    if (typeof video.requestVideoFrameCallback === "function") {
      await new Promise((resolve, reject) => {
        const t = setTimeout(
          () => reject(new Error("Timed out waiting for a camera frame")),
          timeoutMs,
        );
        video.requestVideoFrameCallback(() => {
          clearTimeout(t);
          resolve();
        });
      });
    } else {
      await new Promise((r) => setTimeout(r, Math.min(350, timeoutMs)));
    }
  } finally {
    video.srcObject = null;
  }
}

export async function waitForVideoTrackPublishable(track, timeoutMs = 12_000) {
  if (!track || track.kind !== "video") return;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (track.readyState === "ended") {
      throw new Error("Video track ended before it was ready to broadcast.");
    }
    if (track.readyState === "live") {
      const remaining = Math.max(500, deadline - Date.now());
      await waitForFirstVideoFrame(track, Math.min(6000, remaining));
      return;
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  throw new Error(
    "Video camera did not become ready in time. Wait a moment after switching sources, then try again.",
  );
}

export async function waitForAudioTrackPublishable(track, timeoutMs = 8000) {
  if (!track || track.kind !== "audio") return;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (track.readyState === "ended") {
      throw new Error("Microphone track ended before it was ready to broadcast.");
    }
    if (track.readyState === "live") {
      await new Promise((r) => setTimeout(r, 120));
      return;
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  throw new Error("Microphone did not become ready in time. Try again.");
}

/** After getUserMedia returns, wait until tracks are producing before exposing the stream as “ready”. */
export async function settleLocalMediaStream(stream) {
  if (!stream) return;
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];
  const waits = [];
  if (videoTrack) waits.push(waitForVideoTrackPublishable(videoTrack));
  if (audioTrack) waits.push(waitForAudioTrackPublishable(audioTrack));
  if (waits.length > 0) await Promise.all(waits);
}
