import { createContext, useContext, useState, useEffect } from "react";

export const PeerContext = createContext();

export const PeerContextProvider = ({ peer, socket, children }) => {
  const [broadcastVideoStream, setBroadcastVideoStream] = useState(
    new MediaStream(),
  );
  const [broadcastAudioStream, setBroadcastAudioStream] = useState(
    new MediaStream(),
  );
  const [peerVideoStreams, setPeerVideoStreams] = useState({});
  const [peerAudioStreams, setPeerAudioStreams] = useState({});

  useEffect(() => {
    window.peerVideoStreams = peerVideoStreams;
    console.log({ peerVideoStreams });
  }, [peerVideoStreams])

  useEffect(() => {
    window.broadcastVideoStream = broadcastVideoStream;
  }, [broadcastVideoStream])

  useEffect(() => {
    window.broadcastAudioStream = broadcastAudioStream;
  }, [broadcastAudioStream])

  useEffect(() => {
    if (!peer || !broadcastAudioStream || !broadcastVideoStream) return;
    peer.on("track", ({ track, peerId, label }) => {
      // deal with incoming track
      console.log(
        `Received ${track.kind} track from peer (${peerId}) with label ${label}`,
      );

      if (label === "video-broadcast") {
        broadcastVideoStream.getVideoTracks().forEach((videoTrack) => {
          videoTrack.stop();
          // broadcastVideoStream.removeTrack(videoTrack);
        });
        setBroadcastVideoStream(new MediaStream([track]));
        // broadcastVideoStream.addTrack(track);
      }

      if (label === "audio-broadcast") {
        broadcastAudioStream.getAudioTracks().forEach((audioTrack) => {
          audioTrack.stop();
          // broadcastAudioStream.removeTrack(audioTrack);
        });
        setBroadcastAudioStream(new MediaStream([track]));
        // broadcastAudioStream.addTrack(track);
      }

      if (label === "peer-video" && track.kind === "video") {
        setPeerVideoStreams((existing) => {
          existing[peerId] = track;
          return existing;
        });
      }
      if (label === "peer-audio" && track.kind === "audio") {
        setPeerAudioStreams((existing) => {
          return {
            ...existing,
            peerId: track,
          };
        });
      }
    });
  }, [peer, broadcastAudioStream, broadcastVideoStream, setBroadcastAudioStream, setBroadcastVideoStream, setPeerAudioStreams, setPeerVideoStreams]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        socket,
        broadcastVideoStream,
        broadcastAudioStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export const usePeerContext = () => {

  return useContext(PeerContext);
}