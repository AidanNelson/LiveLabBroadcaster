"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";
import { VideoFeature } from "@/components/VideoObject";
import { PeerContextProvider } from "@/components/PeerContext";
import { StageContextProvider } from "@/components/StageContext";
import { theme } from "@/theme";
import { Editor } from "@/components/Editor";








import { ScriptableObject } from "@/components/ScriptObject";
import { useUser } from "../../../hooks/useUser";
import { Header } from "@/components/header";
import {
  BroadcastVideoSurface,
  BroadcastAudioPlayer,
} from "@/components/VideoObject";


import { useSearchParams } from "next/navigation";
import { useStageIdFromSlug } from "@/hooks/useStageIdFromSlug";
import { ChatBox } from "@/components/Chat";


import { useStageInfo } from "@/hooks/useStageInfo";
import { EditorContextProvider } from "@/components/Editor/EditorContext";

import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('../../../components/KonvaCanvas'), {
  ssr: false,
});
const drawerWidth = 500;


const StageInner = ({ params }) => {
  // const useParams = use(params)
  // const slug = useParams.slug
  // const {stageId} = useStageIdFromSlug({slug: params.slug})
  const { stageInfo, features } = useStageInfo({ slug: params.slug });

  const [editorStatus, setEditorStatus] = useState({
    isEditor: false,
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
  const myMousePosition = useRef({ x: -10, y: -10 });
  const stageContainerRef = useRef();


  // const [stageInfo, setStageInfo] = useState(false);
  // const [features, setFeatures] = useState([]);

  const [isEditor, setIsEditor] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [displayNamesForChat, setDisplayNamesForChat] = useState({});
  const [chatCollapsed, setChatCollapsed] = useState(true);

  // add these to the window so they can be toggled from the interactable sketches
  useEffect(() => {
    window.openChat = () => {
      setChatCollapsed(false);
    };
    window.closeChat = () => {
      setChatCollapsed(true);
    };
    if (hideChat) {
      window.openChat = () => null;
      window.closeChat = () => null;
    }
  }, [hideChat]);

  const keys = useRef({});



  useEffect(() => {
    console.log({ stageInfo, user });
    if (!stageInfo || !user) return;
    if (stageInfo.collaborator_ids.includes(user.id)) {
      setIsEditor(true);
      console.log("Setting isEditor to true!");
    }
  }, [stageInfo, user]);

  useEffect(() => {
    if (isEditor) {
      setShowHeader(true);
    }
  }, [isEditor]);

  const toggleEditorShown = useCallback(() => {
    setEditorOpen(!editorOpen);
  }, [editorOpen]);

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

    const chatListener = (info) => {
      setChatMessages(info.chats);
      let names = {};
      for (let i = 0; i < info.displayNamesForChat.length; i++) {
        let id = info.displayNamesForChat[i].socketId;
        let name = info.displayNamesForChat[i].displayName;
        names[id] = name;
      }
      setDisplayNamesForChat(names);
    };
    socket.on("chat", chatListener);

    return () => {
      socket.off("peerInfo", peerInfoListener);
      // socket.off("stageInfo", stageInfoListener);
      socket.off("chat", chatListener);
    };
  }, [socket]);

  return (
    <>
      {stageInfo && (
        <StageContextProvider stageInfo={stageInfo}>
          <PeerContextProvider peer={peer}>
            <EditorContextProvider editorStatus={editorStatus} setEditorStatus={setEditorStatus}>
              <div>
                {showHeader && <Header toggleEditorShown={toggleEditorShown} />}

                {editorOpen && (
                  <div
                   
                  >
                    {/* {showHeader && <Toolbar />} */}

                    <Editor stageInfo={stageInfo} />
                  </div>
                )}

                <div
                  component="main"
                  sx={{
                    width: editorOpen ? `calc(100vw - ${drawerWidth}px)` : `100%`,
                    p: 0,
                  }}
                >
                  {/* {showHeader && <Toolbar />} */}
                  <div
                    className="mainStage"
                    style={{
                      height: showHeader
                        ? "calc(100vh - 64px)"
                        : `calc(100vh - ${hideChat ? "0px" : "30px"})`,
                    }}
                  >
                    <div className={"stageContainer"} ref={stageContainerRef}>

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
                              return (<Canvas
                                key={featureInfo.id}
                                featureInfo={featureInfo}
                                featureIndex={featureIndex}
                              />);
                          }
                        } else return null;
                      })}
                    </div>
                  </div>
                </div>
                {!hideChat && (
                  <ChatBox
                    chatMessages={chatMessages}
                    displayNamesForChat={displayNamesForChat}
                    collapsed={chatCollapsed}
                    setCollapsed={setChatCollapsed}
                  />
                )}
              </div>
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
          <div
           
          >
            <div >
              <button
                onClick={() => setHasInteracted(true)}
               
              >
               <h3>Enter Show</h3>
              </button>
            </div>
          </div>
        )}
        {hasInteracted && <StageInner params={params} />}
    </>
  );
}
