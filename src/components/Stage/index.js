import { useState } from "react";
import { useStageContext } from "../StageContext";
import { BroadcastVideoSurface } from "../VideoObject";
import { BroadcastAudioPlayer } from "../VideoObject";
import { ScriptableObject } from "../ScriptObject";
import { CanvasFeature } from "../KonvaCanvas";
import styles from './Stage.module.css'
import { Chat } from "../Chat";

export const MainStageControls = () => {
    const [controlsOpen, setControlsOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);


    return (
        <>
            <div className={styles.stageControls}>
                <div className={styles.leftBarContainer}>
                    <button className={styles.leftBarButton} onClick={() => { setControlsOpen(!controlsOpen) }}>{controlsOpen ? "∨" : "∧"}</button>
                    {controlsOpen && (
                        <>
                            <button className={styles.leftBarButton}>A</button>
                            <button className={styles.leftBarButton} onClick={() => { setChatOpen(!chatOpen) }}>Chat</button>
                            <button className={styles.leftBarButton}>Info</button>
                            <button className={styles.leftBarButton}>?</button>
                        </>
                    )}
                </div>
                {chatOpen && (
                    <>
                        <div className={styles.chatContainer}>
                            <Chat />
                        </div>
                    </>)
                }
            </div>
        </>
    )
}

export const MainStage = () => {
    const { features } = useStageContext();
    return (
        <>
            <div className={styles.stage}>

                <BroadcastVideoSurface />
                <BroadcastAudioPlayer />
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
                                return (<CanvasFeature
                                    key={featureInfo.id}
                                    featureInfo={featureInfo}
                                    featureIndex={featureIndex}
                                />);
                        }
                    } else return null;
                })}
            </div>

        </>)
}
