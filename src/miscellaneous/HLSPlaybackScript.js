const videoInfo = [
  {
    hlsManifest: "assets/hls-videos/demo-01/manifest.m3u8",
    duration: 113.09999999999994,
    artist: "Excha Pluwn",
    description: "a work of folly",
  },
  {
    hlsManifest: "assets/hls-videos/demo-02/manifest.m3u8",
    duration: 113.09999999999994,
    artist: "Foible Chappie",
    description: "a work of wisdom",
  },
];

const startTime = new Date(1990, 8, 19, 12, 12, 0);
const videoEl = document.getElementById("video");
let socket = window.parent.socket;

const baseURL = "http://localhost:3000/";

// keep track of if we've initialized some values;
let initialized = false;
let currentlyPlayingVideoIndex = -1;

// let's keep track of a serverTimeOffset value which will
// be the difference between local (client) time and the
// server's clock
let serverTimeOffset = 0;
function calculateServerTimeOffset(serverTime) {
  const clientTime = Date.now();
  const timeOffset = serverTime - clientTime;
  console.log("Server Time Offset:", timeOffset);
  return timeOffset;
}

socket.on("serverTime", ({ serverTime }) => {
  serverTimeOffset = calculateServerTimeOffset(serverTime);
  if (!initialized) {
    updateVideoPlayer();
    initialized = true;
  }
});

function updateVideoPlayer() {
  // calculate the total length of the loop in MS
  let totalLengthOfLoop = 0;
  videoInfo.forEach((video) => {
    totalLengthOfLoop += video.duration * 1000;
  });

  // calculate where we are in the loop based on the startTime and current serverTime
  const calculatedServerTime = Date.now() + serverTimeOffset;
  const elapsedTimeOnServer = calculatedServerTime - startTime; // Calculate elapsed time
  const positionInLoop = elapsedTimeOnServer % totalLengthOfLoop; // Calculate position within the loop
  console.log({ elapsedTimeOnServer, positionInLoop });

  // calculate which video to play based on the above
  let startOffset = 0;
  let videoToPlayIndex = -1;
  for (let i = 0; i < videoInfo.length; i++) {
    if (positionInLoop < startOffset + videoInfo[i].duration * 1000) {
      videoToPlayIndex = i;
      break;
    }
    startOffset += videoInfo[i].duration * 1000;
  }
  console.log({ videoToPlayIndex });

  // calculate where in the video to play
  let durationBeforeDesiredVideo = 0;
  for (let j = 0; j < videoToPlayIndex; j++) {
    durationBeforeDesiredVideo += videoInfo[j].duration * 1000;
  }
  let positionInDesiredVideo = positionInLoop - durationBeforeDesiredVideo;
  console.log({ positionInDesiredVideo });

  // set videoplayer to play the desired video with the desired position
  const localPlaybackPosition =
    (positionInDesiredVideo + serverTimeOffset) / 1000;
  updateHLSPlayback(videoToPlayIndex, localPlaybackPosition);
}

function updateHLSPlayback(desiredVideoIndex, positionInDesiredVideo) {
  // don't swap videos if we're already playing the right one
  if (desiredVideoIndex === currentlyPlayingVideoIndex) return;

  console.log("updating video element");

  const videoData = videoInfo[desiredVideoIndex];
  if (hls) {
    hls.destroy();
  }
  var hls = new Hls();
  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    console.log("video and hls.js are now bound together !");
  });
  hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
    console.log(
      "manifest loaded, found " + data.levels.length + " quality level",
    );
  });
  hls.loadSource(baseURL + videoData.hlsManifest);
  // bind them together
  hls.attachMedia(videoEl);

  // When the video metadata is loaded, set the playback start time
  const handleMetadataLoaded = () => {
    videoEl.currentTime = positionInDesiredVideo;
    videoEl.play();
    currentlyPlayingVideoIndex = desiredVideoIndex;
  };

  videoEl.addEventListener("loadedmetadata", handleMetadataLoaded);

  const handleVideoEnded = () => {
    console.log("videoEnded");
    updateVideoPlayer();
  };
  videoEl.addEventListener("ended", handleVideoEnded);
}
