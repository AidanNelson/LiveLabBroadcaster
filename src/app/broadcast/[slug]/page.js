"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MediaDeviceSelector } from "@/components/MediaDeviceSelector";
import { useSimpleMediasoupPeer } from "@/hooks/useSimpleMediasoupPeer";

import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Typography from "@mui/material/Typography";
import { theme } from "@/theme";
import { Grid, Slider, Button } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";


function getBandwidthDefault() {
  return 3000;
}
function BroadcastInner({ params }) {
  
  const {stageId} = useStageIdFromSlug({slug: params.slug})

  const [initialized, setInitialized] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [streamStatus, setStreamStatus] = useState("Not Streaming");

  const bandwidthIndicatorRef = useRef();
  const [bandwidth, setBandwidth] = useState(getBandwidthDefault);

  // console.log(params);
  const { peer } = useSimpleMediasoupPeer({
    autoConnect: true,
    roomId: stageId,
    url: process.env.NEXT_PUBLIC_REALTIME_SERVER_ADDRESS || "http://localhost",
    port: process.env.NEXT_PUBLIC_REALTIME_SERVER_PORT || 3030,
  });

  const videoPreviewRef = useRef();

  const startBroadcast = useCallback(() => {
    if (!peer) return;
    const videoTrackLabel = "video-broadcast";
    console.log("Starting broadcast!");
    console.log(localStream);
    const videoEncodings = [{ maxBitrate: bandwidth * 1000 }];
    console.log({ videoEncodings });
    let videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      if (peer.producers[videoTrackLabel]) {
        peer.producers[videoTrackLabel].close();
        delete peer.producers[videoTrackLabel];
        delete peer.tracksToProduce[videoTrackLabel];
        console.log("exists?", peer.producers[videoTrackLabel]);
      }
      console.log(peer.producers[videoTrackLabel]);
      console.log("adding video track");
      peer.addTrack(videoTrack, videoTrackLabel, true, videoEncodings);
    }
    let audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      peer.addTrack(audioTrack, "audio-broadcast", true);
    }
  }, [localStream, peer, bandwidth]);

  useEffect(() => {
    if (!localStream) return;
    console.log(localStream.getVideoTracks()[0].getSettings());

    if ("srcObject" in videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = localStream;
    } else {
      videoPreviewRef.current.src = window.URL.createObjectURL(localStream);
    }
    videoPreviewRef.current.onloadedmetadata = (e) => {
      videoPreviewRef.current.play().catch((e) => {
        console.log("Play Error: " + e);
      });
    };
  }, [localStream]);

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >
        <Grid item xs={6}>
          <Typography variant="h3">Broadcast to Venue</Typography>
          <br />
          <MediaDeviceSelector
            localStream={localStream}
            setLocalStream={setLocalStream}
          />
          <br />
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={6}>
              <video
                ref={videoPreviewRef}
                muted
                autoPlay
                style={{ maxWidth: "50vw" }}
              />
            </Grid>
          </Grid>
          <Typography id="input-slider" gutterBottom>
            Broadcast Bandwidth in Kbps ({getBandwidthDefault()} is default):{" "}
            {bandwidth}
          </Typography>
          <Slider
            size="small"
            defaultValue={bandwidth}
            aria-label="Small"
            valueLabelDisplay="auto"
            min={100}
            max={10000}
            onChange={(e) => {
              setBandwidth(e.target.value);
            }}
            aria-labelledby="input-slider"
          />

          <Button
            variant="text"
            size="large"
            id="startBroadcast"
            onClick={startBroadcast}
          >
            <Typography variant="h4">
              Start / Replace Broadcast Stream
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default function MyPage({ params }) {
  
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      <ThemeProvider theme={theme}>
      <CssBaseline />

        {!hasInteracted && (
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "100vh" }}
          >
            <Grid item xs={3}>
              <Button
                onClick={() => setHasInteracted(true)}
                variant="text"
                size="large"
              >
                <Typography variant="h3">Enter Broadcaster</Typography>
              </Button>
            </Grid>
          </Grid>
        )}
        {hasInteracted && <BroadcastInner params={params} />}
      </ThemeProvider>
    </>
  );
}
