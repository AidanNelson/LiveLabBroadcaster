import { useState, useRef, useEffect } from "react";
import { useStageContext } from "../StageContext";
import { BroadcastVideoSurface } from "../VideoObject";
import { BroadcastAudioPlayer } from "../VideoObject";
import { ScriptableObject } from "../ScriptObject";
import { CanvasFeature } from "../KonvaCanvas";
import styles from "./Stage.module.scss";
import { Chat } from "../Chat";
import { ShowInfoPanel } from "../ShowInfoPanel";
import { CiCircleInfo } from "react-icons/ci";
import { CiChat1 } from "react-icons/ci";
import { CiSettings } from "react-icons/ci";
import { FiChevronsDown } from "react-icons/fi";
import { FiChevronsUp } from "react-icons/fi";
import { useEditorContext } from "../Editor/EditorContext";
import { AmbientCopresenceOverlay } from "../AmbientCopresence";
import { CiFaceSmile } from "react-icons/ci";
import { IoIosHeartEmpty } from "react-icons/io";
import { IoEllipseOutline } from "react-icons/io5";
import { IoAlert } from "react-icons/io5";
import { GoEye } from "react-icons/go";
import { CiNoWaitingSign } from "react-icons/ci";
import { useRealtimeContext } from "../RealtimeContext";


const EmotesPanel = ({ isVisible, hidePanel }) => {
  const { socket } = useRealtimeContext();
  const [flashing, setFlashing] = useState({
    "heart": false,
    "surprise": false,
    "eye": false,
    "bad": false
  })
  
  const flashTimeouts = useRef({
    "heart": null,
    "surprise": null,
    "eye": null,
    "bad": null
  });

  const buttonRefs = useRef({
    "heart": null,
    "surprise": null,
    "eye": null,
    "bad": null
  });

  const emote = (type) => {
    if (socket) {
      socket.emit('emote', { from: socket.id, type: type });
      setFlashing((prev) => ({ ...prev, [type]: false }));
      // Reset animation by removing and re-adding the class
      const btn = buttonRefs.current[type];
      if (btn) {
        btn.classList.remove(styles.flashing);
        // Force reflow
        void btn.offsetWidth;
        btn.classList.add(styles.flashing);
      }
      setFlashing((prev) => ({ ...prev, [type]: true }));
      if (flashTimeouts.current[type]) {
        clearTimeout(flashTimeouts.current[type]);
      }
      flashTimeouts.current[type] = setTimeout(() => {
        setFlashing((prev) => ({ ...prev, [type]: false }));
        if (btn) btn.classList.remove(styles.flashing);
      }, 500);
    }
  };

  useEffect(() => {
    const onClick = (e) => {
      if (e.key === "1") {
        emote('heart');
      } else if (e.key === "2") {
        emote('surprise');
      } else if (e.key === "3") {
        emote('eye');
      } else if (e.key === "4") {
        emote('bad');
      }
    }
    document.body.addEventListener('keydown', onClick);
    return () => {
      document.body.removeEventListener('keydown', onClick);
    };
  })



  return (
    <div
      // className={styles.infoPanel}
      style={{
        display: isVisible ? "block" : "none",
        position: "absolute",
        bottom: "3rem",
        left: "10rem",
        border: "1px solid var(--ui-off-white)",
        background: "var(--overlay-light-color)",
        width: "300px",
        // maxWidth: "calc(100vw - 6rem)",
        height: "8rem",
        pointerEvents: "auto",
        borderRadius: "var(--primary-border-radius)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: "100%" }}>
        <button
          ref={el => buttonRefs.current["heart"] = el}
          className={`${styles.emoteButton}`}
          onClick={() => {
            emote("heart");
          }}
        >
          <IoIosHeartEmpty />
          1
        </button>
        <button
          ref={el => buttonRefs.current["surprise"] = el}
          className={`${styles.emoteButton}`}
          onClick={() => {
            emote("surprise");
          }}
        >
          <IoAlert />
          2
        </button>
        <button
          ref={el => buttonRefs.current["eye"] = el}
          className={`${styles.emoteButton}`}
          onClick={() => {
            emote("eye");
          }}
        >
          <GoEye />
          3
        </button>
        <button
          ref={el => buttonRefs.current["bad"] = el}
          className={`${styles.emoteButton}`}
          onClick={() => {
            emote("bad");
          }}
        >
          <CiNoWaitingSign />
          4
        </button>
      </div>
    </div>
  )
}


export const MainStageControls = () => {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showInfoOpen, setShowInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emotesOpen, setEmotesOpen] = useState(false);


  //
  const [hide, setHide] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const onMouseMove = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      setHide(false);

      timer.current = setTimeout(() => {
        setHide(true);
      }, 5000);
    }
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [setHide]);
  //
  return (
    <>
      <div
        className={styles.stageControls}
        style={{
          opacity: hide ? 0 : 1,
          transition: hide ? "opacity 1s ease" : "opacity 0.1s ease"
        }}
      >
        <div className={styles.leftBarContainer}>
          {controlsOpen && (
            <>
              <button
                className={`${styles.leftBarButton} ${chatOpen ? styles.active : ""
                  }`}
                onClick={() => {
                  setChatOpen(!chatOpen);
                }}
              >
                <CiChat1 />
              </button>
              <button
                className={`${styles.leftBarButton} ${showInfoOpen ? styles.active : ""
                  }`}
                onClick={() => {
                  setShowInfoOpen(!showInfoOpen);

                  setSettingsOpen(false);
                  setEmotesOpen(false);
                }}
              >
                <CiCircleInfo />
              </button>
              <button
                className={`${styles.leftBarButton} ${settingsOpen ? styles.active : ""
                  }`}
                onClick={() => {
                  setSettingsOpen(!settingsOpen);

                  setEmotesOpen(false);
                  setShowInfoOpen(false);
                }}
              >
                <CiSettings />
              </button>
              <button
                className={`${styles.leftBarButton} ${emotesOpen ? styles.active : ""
                  }`}
                onClick={() => {
                  setEmotesOpen(!emotesOpen);

                  setSettingsOpen(false);
                  setShowInfoOpen(false);
                }}
              >
                <CiFaceSmile />
              </button>
            </>
          )}
          <button
            className={`${styles.leftBarButton}`}
            onClick={() => {
              setControlsOpen(!controlsOpen);
            }}
          >
            {controlsOpen ? <FiChevronsDown /> : <FiChevronsUp />}
          </button>

        </div>
        {chatOpen && (
          <>
            <div className={styles.chatContainer}>
              <Chat closeChat={() => setChatOpen(false)} />
            </div>
          </>
        )}

        <ShowInfoPanel
          isVisible={showInfoOpen}
          hidePanel={() => setShowInfoOpen(false)}
          left="10rem"
        />

        <EmotesPanel
          isVisible={emotesOpen}
          hidePanel={() => setEmotesOpen(false)}
        />
      </div>
    </>
  );
};

export const MainStage = () => {
  const { features } = useStageContext();
  const { editorStatus } = useEditorContext();
  return (
    <>
      <AmbientCopresenceOverlay />

      <div className={styles.stage}>
        <BroadcastVideoSurface />
        <BroadcastAudioPlayer />
        {editorStatus.isEditor && (
          <>
            {editorStatus.featureToPreview && (
              <>
                {editorStatus.featureToPreview.type === "scriptableObject" && (
                  <ScriptableObject
                    key={editorStatus.featureToPreview.id}
                    scriptableObjectData={editorStatus.featureToPreview}
                  />
                )}
              </>
            )}
            {!editorStatus.featureToPreview && (
              <>
                {features.map((featureInfo, featureIndex) => {
                  if (featureInfo.active) {
                    switch (featureInfo.type) {
                      case "scriptableObject":
                        return (
                          <ScriptableObject
                            key={featureInfo.id}
                            scriptableObjectData={featureInfo}
                          />
                        );
                      case "canvas":
                        return (
                          <CanvasFeature
                            key={featureInfo.id}
                            featureInfo={featureInfo}
                            featureIndex={featureIndex}
                          />
                        );
                    }
                  } else return null;
                })}
              </>
            )}
          </>
        )}
        {!editorStatus.isEditor && (
          <>
            {features.map((featureInfo, featureIndex) => {
              if (featureInfo.active) {
                switch (featureInfo.type) {
                  case "scriptableObject":
                    return (
                      <ScriptableObject
                        key={featureInfo.id}
                        scriptableObjectData={featureInfo}
                      />
                    );
                  case "canvas":
                    return (
                      <CanvasFeature
                        key={featureInfo.id}
                        featureInfo={featureInfo}
                        featureIndex={featureIndex}
                      />
                    );
                }
              } else return null;
            })}
          </>
        )}
      </div>
    </>
  );
};
