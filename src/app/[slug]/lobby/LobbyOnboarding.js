"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@/components/AuthContextProvider";

import { MediaDeviceSelector } from "@/components/MediaDeviceSelector/index";
import Typography from "@/components/Typography";
import styles from "./LobbyOnboarding.module.scss";
import { useUserMediaContext } from "@/components/UserMediaContext";

const AVATAR_COLORS = {
  magenta: "#FF2D55",
  yellow: "#FC0",
  cyan: "#32ADE6",
  red: "#FF2E23",
  blue: "#007AFF",
};

export const LobbyOnboarding = ({
  setHasCompletedOnboarding,
  hasCompletedOnboarding,
}) => {
  const { user, displayName, setDisplayName, displayColor, setDisplayColor } =
    useAuthContext();

  const videoPreviewRef = useRef();
  const [videoWidth, setVideoWidth] = useState(300 * 16/9);
  const {
    localStream,
    hasRequestedMediaDevices,
    setHasRequestedMediaDevices,
    skippedMediaDeviceSetup,
    setSkippedMediaDeviceSetup,
    devicesInfo,
    switchDevice,
  } = useUserMediaContext();

  const [currentOnboardingStep, setCurrentOnboardingStep] = useState("name");

  useEffect(() => {
    console.log("localstream:", localStream);
    if (!localStream) return;
    videoPreviewRef.current.srcObject = localStream;
    videoPreviewRef.current.onLoadedMetadata = () => {
      console.log("play video");
      videoPreviewRef.current.play();
    };
  }, [localStream]);

  useEffect(() => {}, []);

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.header}>
        <Typography variant="hero">
          Before we get started, <br />
          let's check a few things
        </Typography>
        <Typography variant="subtitle">
          Please reply to the following questions before entering the lobby
        </Typography>
      </div>
      <div className={styles.questionsAndAvatarPreview}>
        <div className={styles.questions}>
          {currentOnboardingStep === "name" && (
            <div className={styles.nameInputAndLabel}>
              <Typography variant="heading">
                <label htmlFor="displayName">What is your name? </label>
              </Typography>
              <Typography
                variant="body2"
                style={{ color: "var(--text-secondary-color)" }}
              >
                This will be seen within the lobby space and during the show
              </Typography>

              <input
                id="displayName"
                type="text"
                value={displayName}
                placeholder="Your Name"
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}
          {currentOnboardingStep === "color" && (
            <div className={styles.colorPickerAndLabel}>
              <Typography variant="heading">
                <label htmlFor="colorPicker">Choose a color (optional)</label>
              </Typography>
              <Typography
                variant="body2"
                style={{ color: "var(--text-secondary-color)" }}
              >
                This is how people will see you in the lobby
              </Typography>
              <div className={styles.buttonContainer}>
                <button
                  onClick={(e) => {
                    setDisplayColor(AVATAR_COLORS.magenta);
                  }}
                  style={{ backgroundColor: AVATAR_COLORS.magenta }}
                ></button>
                <button
                  onClick={(e) => {
                    setDisplayColor(AVATAR_COLORS.yellow);
                  }}
                  style={{ backgroundColor: AVATAR_COLORS.yellow }}
                ></button>
                <button
                  onClick={(e) => {
                    setDisplayColor(AVATAR_COLORS.cyan);
                  }}
                  style={{ backgroundColor: AVATAR_COLORS.cyan }}
                ></button>
                <button
                  onClick={(e) => {
                    setDisplayColor(AVATAR_COLORS.red);
                  }}
                  style={{ backgroundColor: AVATAR_COLORS.red }}
                ></button>
                <button
                  onClick={(e) => {
                    setDisplayColor(AVATAR_COLORS.blue);
                  }}
                  style={{ backgroundColor: AVATAR_COLORS.blue }}
                ></button>
              </div>
            </div>
          )}
          {currentOnboardingStep === "media" && (
            <>
              <Typography variant="heading">
                Choose your webcam and microphone (optional)
              </Typography>
              <Typography
                variant="body2"
                style={{ color: "var(--text-secondary-color)" }}
              >
                This will let you speak with others within the lobby space
              </Typography>
              {/* {!hasRequestedMediaDevices && !skippedMediaDeviceSetup && (
                <>
                  <button
                    className={"buttonSmall"}
                    onClick={() => {
                      setHasRequestedMediaDevices(true);
                    }}
                  >
                    <Typography variant="buttonSmall">
                      Join with Webcam
                    </Typography>
                  </button>
                  <button
                      className={"buttonText"}
                      onClick={() => {
                        setSkippedMediaDeviceSetup(true);
                      }}
                    >
                      <Typography variant="buttonSmall">
                        Join without Webcam
                      </Typography>
                    </button>
                </>
              )} */}
              <MediaDeviceSelector />
            </>
          )}
          <div className={styles.entranceButtons}>
            {currentOnboardingStep === "name" && (
              <button
                className={
                  "buttonSmall" + (displayName.length ? "" : " disabled")
                }
                onClick={() => {
                  if (displayName.length) setCurrentOnboardingStep("color");
                }}
              >
                <Typography
                  variant="buttonSmall"
                >
                  Next
                </Typography>
              </button>
            )}
            {currentOnboardingStep === "color" && (
              <>
                <button
                  className={"buttonText"}
                  onClick={() => {
                    setCurrentOnboardingStep("name");
                  }}
                >
                  <Typography
                    variant="buttonSmall"
                  >
                    Prev
                  </Typography>
                </button>
                <button
                  className={"buttonSmall"}
                  onClick={() => {
                    setHasRequestedMediaDevices(true);
                    setCurrentOnboardingStep("media");
                  }}
                >
                  <Typography
                    variant="buttonSmall"
                  >
                    Next
                  </Typography>
                </button>
                
                {/* {!hasRequestedMediaDevices && !skippedMediaDeviceSetup && (
                  <>
                    <button
                      className={"buttonSmall"}
                      onClick={() => {
                        setHasRequestedMediaDevices(true);
                        setCurrentOnboardingStep("media");
                      }}
                    >
                      <Typography variant="buttonSmall">
                        Join with Webcam
                      </Typography>
                    </button>
                    <button
                      className={"buttonText"}
                      onClick={() => {
                        setSkippedMediaDeviceSetup(true);
                      }}
                    >
                      <Typography variant="buttonSmall">
                        Join without Webcam
                      </Typography>
                    </button>
                  </>
                )} */}
              </>
            )}

            {currentOnboardingStep === "media" && (
              <>
                <button
                  className={"buttonText"}
                  onClick={() => {
                    setCurrentOnboardingStep("color");
                  }}
                >
                  <Typography
                    variant="buttonSmall"
                  >
                    Prev
                  </Typography>
                </button>
                <button
                  className={"buttonSmall"}
                  onClick={() => setHasCompletedOnboarding(true)}
                  style={{
                    alignSelf: "center",
                  }}
                >
                  <Typography variant="buttonSmall">Enter Lobby</Typography>
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.avatarPreviewContainer}>
          <div className={styles.avatarPreviewAndLabel}>
            <div className={styles.svgAndVideo}>
              <svg>
                <clipPath id="circleClip">
                  <circle cx={videoWidth / 2} cy="150" r="137" />
                </clipPath>
                <circle
                  cx={0}
                  cy="150"
                  r="140"
                  stroke={displayColor}
                  strokeWidth="10"
                  fill="none"
                />
              </svg>
              <video
                onResize={(e) => {
                  setVideoWidth(e.target.clientWidth);
                }}
                style={{ position: "absolute", clipPath: "url(#circleClip)", width: videoWidth, marginLeft: "calc(50% - " + videoWidth/2 + "px)" }}
                ref={videoPreviewRef}
                autoPlay
                muted
              />
            </div>
            <Typography variant="subtitle">
              {displayName || "Your Name"}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
