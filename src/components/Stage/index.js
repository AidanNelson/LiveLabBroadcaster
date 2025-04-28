import { useState } from "react";
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

export const MainStageControls = () => {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showInfoOpen, setShowInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className={styles.stageControls}>
        <div className={styles.leftBarContainer}>
        {controlsOpen && (
            <>
              <button
                className={`${styles.leftBarButton} ${
                  chatOpen ? styles.active : ""
                }`}
                onClick={() => {
                  setChatOpen(!chatOpen);
                }}
              >
                <CiChat1 />
              </button>
              <button
                className={`${styles.leftBarButton} ${
                  showInfoOpen ? styles.active : ""
                }`}
                onClick={() => {
                  setShowInfoOpen(!showInfoOpen);
                }}
              >
                <CiCircleInfo />
              </button>
              {/* <button
                className={`${styles.leftBarButton} ${
                  settingsOpen ? styles.active : ""
                }`}
                onClick={() => {
                  setSettingsOpen(!settingsOpen);
                }}
              >
                <CiSettings />
              </button> */}
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
      </div>
    </>
  );
};

export const MainStage = () => {
  const { features } = useStageContext();
  const { editorStatus } = useEditorContext();
  return (
    <>
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
