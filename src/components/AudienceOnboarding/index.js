"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/components/AuthContextProvider";

import Typography from "@/components/Typography";
import styles from "./AudienceOnboarding.module.scss";
import { useUserMediaContext } from "@/components/UserMediaContext";
import { Button } from "@/components/Button";

const NamePicker = () => {
  const { displayName, setDisplayName } = useAuthContext();

  return (
    <div className={styles.nameInputAndLabel}>
      <Typography variant="heading">
        <label htmlFor="displayName">What is your name? </label>
      </Typography>
      <Typography
        variant="body2"
        style={{ color: "var(--text-secondary-color)" }}
      >
        This will be visible during the show (e.g. in chat).
      </Typography>

      <input
        id="displayName"
        type="text"
        value={displayName}
        placeholder="Your Name"
        onChange={(e) => setDisplayName(e.target.value)}
      />
    </div>
  );
};

export const AudienceOnboarding = ({ setHasCompletedOnboarding }) => {
  const { displayName } = useAuthContext();

  const { setUseAudioProcessing } = useUserMediaContext();

  useEffect(() => {
    if (!setUseAudioProcessing) return;
    setUseAudioProcessing(false);
  }, [setUseAudioProcessing]);

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.header}>
        <Typography variant="hero">
          Before we get started, <br />
          let&apos;s check a few things
        </Typography>
        <Typography variant="subtitle">
          Please choose a display name before entering the stage.
        </Typography>
      </div>
      <div className={styles.questionsAndAvatarPreview}>
        <div className={styles.questions}>
          <NamePicker />
          <div className={styles.entranceButtons}>
            <Button
              variant="primary"
              size="large"
              disabled={!displayName.length}
              onClick={() => {
                if (displayName.length) setHasCompletedOnboarding(true);
              }}
            >
              <Typography variant={"buttonLarge"}>Enter</Typography>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
