"use client";

import { StageEditor } from "@/components/Editor";
import { useEditorContext } from "@/components/Editor/EditorContext";
import { RealtimeContextProvider } from "@/components/RealtimeContext";
import { useState, useEffect } from "react";
import BroadcastStreamControls from "./broadcast/page";
import LobbyAdmin from "./lobby/page";
import { useSearchParams } from "next/navigation";

export default function Stage() {
    const { editorStatus } = useEditorContext();
    const [currentActiveTab, setCurrentActiveTab] = useState("lobby");
    const searchParams = useSearchParams();

    const tab = searchParams.get("tab");

    useEffect(() => {
        if (tab && ["lobby", "stage", "stream"].includes(tab)) {
            setCurrentActiveTab(tab);
        }
    }, [tab]);


    return (
        <>
            {editorStatus.isEditor && (
                <>
                    <div className={`${currentActiveTab === "stage" ? "" : "hidden"}`}>
                        <RealtimeContextProvider isLobby={false}>
                            <StageEditor />
                        </RealtimeContextProvider>
                    </div>

                    <div className={`${currentActiveTab === "stream" ? "" : "hidden"}`}>
                        <BroadcastStreamControls />
                    </div>

                    <div className={`${currentActiveTab === "lobby" ? "" : "hidden"}`}>
                        <LobbyAdmin />
                    </div>
                </>
            )}

        </>
    );
}
