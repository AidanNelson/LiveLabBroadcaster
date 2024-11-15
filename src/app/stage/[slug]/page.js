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
import { MainStage } from "@/components/Stage";


const AudienceView = () => {


  return (
    <div style={{
      border: '1px solid red',
      position: 'absolute',
      top: 0,
      left: '50%',
      width: "50%",
      height: "100%",
    }}>
      <MainStage />
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

  const searchParams = useSearchParams();
  const [hideChat, setHideChat] = useState(false);
  useEffect(() => {
    if (searchParams.get("hideChat")) {
      setHideChat(true);
    }
  }, [searchParams]);

  // add to the window so it can be used from the interactable sketches
  useEffect(() => {
    window.socket = socket;

    return () => {
      window.socket = undefined;
    };
  }, [socket]);

  const user = useUser();

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
      setIsEditor(true);
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
    console.log("joining stage: ", stageInfo.id);
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
          <PeerContextProvider peer={peer}>
            <EditorContextProvider editorStatus={editorStatus} setEditorStatus={setEditorStatus}>
              {editorStatus.isEditor && (
                <EditorView />
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

      {!hasInteracted && (

        <button
          onClick={() => setHasInteracted(true)}

        >
          <h3>Enter Show</h3>
        </button>

      )}
      {hasInteracted && <StageInner params={params} />}
    </>
  );
}
