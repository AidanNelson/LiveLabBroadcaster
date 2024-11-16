"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";
import { StageContextProvider } from "@/components/StageContext";
import { Editor } from "@/components/Editor";


import { useUser } from "../../../hooks/useUser";
import { useSearchParams } from "next/navigation";
import { useStageInfo } from "@/hooks/useStageInfo";
import { EditorContextProvider, useEditorContext } from "@/components/Editor/EditorContext";
import { MainStage, MainStageControls } from "@/components/Stage";
import { supabase } from "@/components/SupabaseClient";


const AudienceView = () => {
  return (
    <div style={{
      border: '1px solid red',
      width: "100%",
      height: "100%",
    }}>
      <MainStage />
      <MainStageControls />
    </div>
  )
}
const EditorView = () => {
  const { editorStatus } = useEditorContext();
  return (
    <>
      {editorStatus.editorPanelOpen && (
        <div>
          <Editor stageInfo={stageInfo} />
        </div>
      )
      }
    </>

  )
}

const StageInner = ({ params }) => {
  const { stageInfo, features } = useStageInfo({ slug: params.slug });

  const [editorStatus, setEditorStatus] = useState({
    isEditor: false,
    editorPanelOpen: false,
    target: null,
    type: "menu",
  });

  const { peer, socket } = useSimpleMediasoupPeer({
    autoConnect: false,
    roomId: stageInfo?.id,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  // const searchParams = useSearchParams();
  // const [hideChat, setHideChat] = useState(false);
  // useEffect(() => {
  //   if (searchParams.get("hideChat")) {
  //     setHideChat(true);
  //   }
  // }, [searchParams]);

  // add to the window so it can be used from the interactable sketches
  useEffect(() => {
    window.socket = socket;

    return () => {
      window.socket = undefined;
    };
  }, [socket]);

  const { user, setDisplayName } = useUser();

  useEffect(() => {

    if (!user) return;
    setDisplayName("Aidan - " + Math.random().toString().slice(2, 5));

  }, [user]);
  // const [isEditor, setIsEditor] = useState(false);
  // const [editorOpen, setEditorOpen] = useState(false);
  // const [showHeader, setShowHeader] = useState(false);
  // const [chatMessages, setChatMessages] = useState([]);
  // const [displayNamesForChat, setDisplayNamesForChat] = useState({});
  // const [chatCollapsed, setChatCollapsed] = useState(true);

  // add these to the window so they can be toggled from the interactable sketches
  // useEffect(() => {
  //   window.openChat = () => {
  //     setChatCollapsed(false);
  //   };
  //   window.closeChat = () => {
  //     setChatCollapsed(true);
  //   };
  //   if (hideChat) {
  //     window.openChat = () => null;
  //     window.closeChat = () => null;
  //   }
  // }, [hideChat]);




  useEffect(() => {
    console.log({ stageInfo, user });
    if (!stageInfo || !user) return;
    if (stageInfo.collaborator_ids.includes(user.id)) {
      // setIsEditor(true);
      setEditorStatus({ ...editorStatus, isEditor: true });
      console.log("Setting isEditor to true!");
    }
  }, [stageInfo, user]);

  // const toggleEditorShown = useCallback(() => {
  //   setEditorOpen(!editorOpen);
  // }, [editorOpen]);

  useEffect(() => {
    if (!socket || !stageInfo) return;

    // const stageInfoListener = (doc) => {
    //   setStageInfo(doc);
    // };

    const peerInfoListener = (info) => {
      window.peers = info;
    };

    socket.on("peerInfo", peerInfoListener);

    // socket.on("stageInfo", stageInfoListener);
    console.log("Join stage: ", stageInfo.id);
    socket.emit("joinStage", stageInfo.id);

    // const chatListener = (info) => {
    //   setChatMessages(info.chats);
    //   let names = {};
    //   for (let i = 0; i < info.displayNamesForChat.length; i++) {
    //     let id = info.displayNamesForChat[i].socketId;
    //     let name = info.displayNamesForChat[i].displayName;
    //     names[id] = name;
    //   }
    //   setDisplayNamesForChat(names);
    // };
    // socket.on("chat", chatListener);

    return () => {
      socket.off("peerInfo", peerInfoListener);
      // socket.off("stageInfo", stageInfoListener);
      // socket.off("chat", chatListener);
    };
  }, [socket]);

  return (
    <>
      {stageInfo && (
        <StageContextProvider stageInfo={stageInfo} features={features}>
          <PeerContextProvider peer={peer} socket={socket}>
            <EditorContextProvider editorStatus={editorStatus} setEditorStatus={setEditorStatus}>
              {editorStatus.isEditor && (
                <AudienceView />
              )}
              {!editorStatus.isEditor && (
                <AudienceView />
              )}
            </EditorContextProvider>
          </PeerContextProvider>
        </StageContextProvider>
      )}
    </>
  );
};

export default function Stage({ params }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <div style={{
        display: 'flex',
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
        {!hasInteracted && (
          <button onClick={() => setHasInteracted(true)}>
            <h3>Enter Show</h3>
          </button>
        )}
        {hasInteracted && <StageInner params={params} />}
      </div>
    </>
  );
}
