"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useStageContext } from "@/components/StageContext";
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
      const roomId = isLobby ? stageInfo?.id + "-lobby" : stageInfo?.id
      const newPeer = new SimpleMediasoupPeer({
        url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
        port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
        roomId,
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
        newPeer._disconnectFromMediasoup();
        newPeer.socket.disconnect();
        setPeer(null)
        setRemoteTracks([])
      }
    }
    initializePeer()
  }, [stageInfo])

  useEffect(() => {
    window.remoteTracks = remoteTracks;
  }, [remoteTracks]);

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


  return (
    <RealtimeContext.Provider
      value={{
        peer,
        socket,
        remoteTracks,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtimeContext = () => {
  return useContext(RealtimeContext);
};
