
import { useEffect, useState, useRef, useCallback } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";
import { StageContextProvider } from "@/components/StageContext";



const Lobby = () => {


    return (
        <div>LOBBY</div>
    )
}

export default function LobbyPage({ params }) {
    const [hasInteracted, setHasInteracted] = useState(false);
    const { stageInfo } = useStageInfo({ slug: params.slug });

    const { peer, socket } = useSimpleMediasoupPeer({
        autoConnect: false,
        roomId: stageInfo?.id,
        url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
        port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
    });


    return (
        <>
            {!hasInteracted && (
                <>
                    <div>Welcome to the lobby</div>
                    <button onClick={() => setHasInteracted(true)}>ENTER</button>
                </>
            )}



            {stageInfo && hasInteracted && (
                <StageContextProvider stageInfo={stageInfo}>
                    <PeerContextProvider peer={peer}>
                        <Lobby />

                    </PeerContextProvider>
                </StageContextProvider>
            )}
        </>
    )


}