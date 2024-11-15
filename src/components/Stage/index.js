import { useStageContext } from "../StageContext";
import { BroadcastVideoSurface } from "../VideoObject";
import { BroadcastAudioPlayer } from "../VideoObject";
import { ScriptableObject } from "../ScriptObject";
import { CanvasFeature } from "../KonvaCanvas";
import styles from './stage.module.css'

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
