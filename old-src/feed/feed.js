/*
A Few Deep Breaths
CultureHub & LaMaMa ETC, May 2022
*/

import { io } from "socket.io-client";
import { SimpleMediasoupPeer } from "simple-mediasoup-peer-client";

let socket;
let mediasoupPeer;

window.onload = () => {
  document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("startButton").style.display = "none";
    init();
  });
};

function init() {
  console.log("~~~~~~~~~~~~~~~~~");

  // hack to prevent issue where we've been scrolled below content...
  window.scrollTo(0, 0);

  socket = io(process.env.SERVER_URL, {
    path: "/socket.io",
  });

  mediasoupPeer = new SimpleMediasoupPeer(socket);
  mediasoupPeer.on("track", gotTrack);
}

//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//

function gotTrack(track, id, label) {
  console.log(`Got track of kind ${label} from ${id}`);

  let isBroadcast = label == "video-broadcast" || label == "audio-broadcast";

  let el = document.getElementById(id + "_" + label);

  if (isBroadcast && track.kind === "video") {
    el = document.getElementById("broadcastVideo");
  }
  if (isBroadcast && track.kind === "audio") {
    el = document.getElementById("broadcastAudio");
    el.volume = 1;
  }

  if (track.kind === "video") {
    if (el == null) {
      console.log("Creating video element for client with ID: " + id);
      el = document.createElement("video");
      el.id = id + "_video";
      el.autoplay = true;
      el.muted = true;
      el.setAttribute("playsinline", true);

      // el.style = "visibility: hidden;";
      document.body.appendChild(el);
    }
  }

  if (track.kind === "audio") {
    if (el == null) {
      console.log("Creating audio element for client with ID: " + id);
      el = document.createElement("audio");
      el.id = id + "_" + label;
      document.body.appendChild(el);
      el.setAttribute("playsinline", true);
      el.setAttribute("autoplay", true);
      el.volume = 0;
    }
  }

  el.srcObject = null;
  el.srcObject = new MediaStream([track]);

  el.onloadedmetadata = (e) => {
    el.play().catch((e) => {
      console.log("Play Error: " + e);
    });
  };
}
