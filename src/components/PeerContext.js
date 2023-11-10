import { createContext, useState, useEffect } from "react";

export const PeerContext = createContext();

export const PeerContextProvider = ({ peer, children }) => {
  const [broadcastVideoStream] = useState(new MediaStream());
  const [broadcastAudioStream] = useState(new MediaStream());

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
          broadcastVideoStream.removeTrack(videoTrack);
        });
        broadcastVideoStream.addTrack(track);
      }

      if (label === "audio-broadcast") {
        broadcastAudioStream.getAudioTracks().forEach((audioTrack) => {
          audioTrack.stop();
          broadcastAudioStream.removeTrack(audioTrack);
        });
        broadcastAudioStream.addTrack(track);
      }
    });
  }, [peer, broadcastAudioStream, broadcastVideoStream]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        broadcastVideoStream,
        broadcastAudioStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
