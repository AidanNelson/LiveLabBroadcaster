"use client";

import { createContext, useContext, useState, useEffect } from "react";
// import { useRealtimePeer } from "@/hooks/useRealtimePeer";
import { useStageContext } from "@/components/StageContext";
// import { usePathname } from "next/navigation";
import debug from "debug";
const logger = debug("broadcaster:realtimeContextProvider");
import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";


export const RealtimeContext = createContext();

export const RealtimeContextProvider = ({
  isLobby = false,
  isAudience = true,
  children,
}) => {
  const { stageInfo } = useStageContext();
  const [peer, setPeer] = useState(null)
  const [remoteTracks, setRemoteTracks] = useState([])
  const [socket, setSocket] = useState(null)

  // Initialize the SimpleMediasoupPeer client
  useEffect(() => {
    if (!stageInfo) return;
    const initializePeer = async () => {
      console.log
      const roomId = isLobby ? stageInfo?.id + "-lobby" : stageInfo?.id
      const newPeer = new SimpleMediasoupPeer({
        url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
        port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
        roomId,
        autoConnect: true,
      })
      await newPeer.joinRoom(roomId)
      const handleTrackAdded = (trackData) => {
        console.log('trackData', trackData)
        const { track, peerId, label, pause, resume } = trackData
        console.log(`Received ${label} track from peer ${peerId}`)

        setRemoteTracks((prev) => {
          // in case the track is already in the list, don't add it again
          // would this ever happen?
          if (prev.find(trackInfo => trackInfo.label === label)) {
            return prev;
          }
          const newTracks = [...prev, { track, peerId, label, pause, resume }]
          return newTracks
        })
      }
      const handleTrackRemoved = (trackData) => {
        const { peerId, label } = trackData
        console.log(`Track ${label} from peer ${peerId} was removed`)
        setRemoteTracks((prev) => {
          const newTracks = prev.filter(trackInfo => trackInfo.label !== label)
          return newTracks
        })
      }

      console.log('newPeer', newPeer)
      newPeer.on('track', handleTrackAdded)
      newPeer.on('trackRemoved', handleTrackRemoved)

      setPeer(newPeer)
      setSocket(newPeer.socket)

      return () => {
        newPeer.off('track', handleTrackAdded)
        newPeer.off('trackRemoved', handleTrackRemoved)
        setPeer(null)
        setRemoteTracks([])
      }
    }
    initializePeer()
  }, [stageInfo])

  useEffect(() => {
    window.remoteTracks = remoteTracks;
  }, [remoteTracks]);

  const value = {
    peer,
    remoteTracks,
  }

  // const [peer, setPeer] = useState(null);
  // const [socket, setSocket] = useState(null);

  // const { peer, socket } = useRealtimePeer({
  //   autoConnect: true,
  //   roomId: isLobby ? stageInfo?.id + "-lobby" : stageInfo?.id,
  //   url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
  //   port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  // });

  // we'll compose a broadcast stream from incoming tracks
  // const [broadcastVideoStream, setBroadcastVideoStream] = useState(
  //   null
  // );
  // const [broadcastAudioStream, setBroadcastAudioStream] = useState(
  //   null
  // );


  // initialize broadcast streams (on mount so we don't get MediaStream undefined errors from React)
  // useEffect(() => {
  //   setBroadcastVideoStream(new MediaStream());
  //   setBroadcastAudioStream(new MediaStream());
  // }, []);

  // same for peer streams
  // const [peerVideoStreams, setPeerVideoStreams] = useState({});
  // const [peerAudioStreams, setPeerAudioStreams] = useState({});

  // add to the window for use in p5.js sketches
  // useEffect(() => {
  //   window.broadcastVideoStream = broadcastVideoStream;
  // }, [broadcastVideoStream]);

  // useEffect(() => {
  //   window.broadcastAudioStream = broadcastAudioStream;
  // }, [broadcastAudioStream]);

  useEffect(() => {
    if (!socket | !isAudience) return;

    const pulseInterval = setInterval(
      () =>
        socket.emit(
          "pulse",
          isLobby ? stageInfo?.id + "-lobby" : stageInfo?.id,
        ),
      2000,
    );
    return () => clearInterval(pulseInterval);
  }, [socket, isAudience, isLobby, stageInfo]);

  // useEffect(() => {
  //   if (!peer) return;
  //   const handleTrack = ({ track, peerId, label }) => {
  //     const stream = new MediaStream([track]);

  //     logger(
  //       `Received track of kind [${track.kind}] from peer [${peerId}] with label [${label}]`,
  //     );

  //     // if (label === "video-broadcast") {
  //     //   broadcastVideoStream.getVideoTracks().forEach((videoTrack) => {
  //     //     videoTrack.stop();
  //     //   });
  //     //   setBroadcastVideoStream(stream);
  //     // }

  //     // if (label === "audio-broadcast") {
  //     //   broadcastAudioStream.getAudioTracks().forEach((audioTrack) => {
  //     //     audioTrack.stop();
  //     //   });
  //     //   setBroadcastAudioStream(stream);
  //     // }

  //     if (label === "peer-video") {
  //       setPeerVideoStreams((prev) => {
  //         return { ...prev, [peerId]: stream };
  //       });
  //     }
  //     if (label === "peer-audio") {
  //       setPeerAudioStreams((prev) => {
  //         return { ...prev, [peerId]: stream };
  //       });
  //     }

  //     // check for inactive streams every 500ms and reset or remove those streams as needed
  //     let checkInterval = setInterval(() => {
  //       if (!stream.active) {
  //         logger("Stream no longer active: ", stream);

  //         if (label === "video-broadcast") {
  //           setBroadcastVideoStream(new MediaStream());
  //           clearInterval(checkInterval);
  //         }
  //         if (label === "audio-broadcast") {
  //           setBroadcastAudioStream(new MediaStream());
  //           clearInterval(checkInterval);
  //         }
  //         if (label === "peer-video") {
  //           setPeerVideoStreams((prev) => {
  //             const newState = { ...prev };
  //             delete newState[peerId];
  //             return newState;
  //           });
  //           clearInterval(checkInterval);
  //         }
  //         if (label === "peer-audio") {
  //           setPeerAudioStreams((prev) => {
  //             const newState = { ...prev };
  //             delete newState[peerId];
  //             return newState;
  //           });
  //           clearInterval(checkInterval);
  //         }
  //       }
  //     }, 1000);

  //     // Store the interval ID so it can be cleared later
  //     stream.checkInterval = checkInterval;
  //   };

  //   peer.on("track", handleTrack);

  //   return () => {
  //     Object.values(peerVideoStreams).forEach((stream) =>
  //       clearInterval(stream.checkInterval),
  //     );
  //     Object.values(peerAudioStreams).forEach((stream) =>
  //       clearInterval(stream.checkInterval),
  //     );
  //     clearInterval(broadcastVideoStream.checkInterval);
  //     clearInterval(broadcastAudioStream.checkInterval);
  //   };
  // }, [
  //   peer,
  //   // broadcastAudioStream,
  //   // broadcastVideoStream,
  //   // setBroadcastAudioStream,
  //   // setBroadcastVideoStream,
  //   // setPeerAudioStreams,
  //   // setPeerVideoStreams,
  // ]);



  return (
    <RealtimeContext.Provider
      value={{
        peer,
        socket,
        remoteTracks,
        // broadcastVideoStream,
        // broadcastAudioStream,
        // peerVideoStreams,
        // peerAudioStreams,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtimeContext = () => {
  return useContext(RealtimeContext);
};
