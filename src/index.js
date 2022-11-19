console.log("ok");

let frameCount = 0;
let visibleInteractions = {
  mouse: false,
};
let mouseElements = {};
let mousePosition = {x: -100, y: -100}

const mouseImageURLs = [new URL("./assets/white-square.png", import.meta.url)];
// add mouse button interaction
document
  .getElementById("mouseInteractionButton")
  .addEventListener("click", (ev) => {
    visibleInteractions.mouse = !visibleInteractions.mouse;
    console.log("currently visible interactions: ", visibleInteractions);
  });

// send server updates on the mouse position
document.addEventListener("pointermove", (ev) => {
    mousePosition = { x: ev.pageX, y: ev.pageY }

});

function init() {
  console.log("~~~~~~~~~~~~~~~~~");
  socket = io("http://localhost:8080", {
    path: "/socket.io",
  });
  socket.on("connection", () => {
    console.log("connected!");
  });

  // we will structure messages as follows
  // {type: 'mouse', data: someData}
  socket.on("interaction", (msg) => {
    handleInteractions(msg);
  });

  //     socket.on("oscForSockets", (data) => {
  //       console.log("Message Received from OSC: ", data);
  //       if (data[0] == "/cue/action/1") {
  //         let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
  //   width=200,height=200,left=200,top=200`;

  //         open("/popup", "test", params);
  //       }
  //     });

  socket.on("clients", (ids) => {
    console.log("Got initial clients!");
    for (const id of ids) {
      if (!(id in peers)) {
        console.log("Client conencted: ", id);
        peers[id] = {};
      }
    }
  });

  socket.on("clientConnected", (id) => {
    console.log("Client conencted: ", id);
    peers[id] = {};
  });

  socket.on("clientDisconnected", (id) => {
    console.log("Client disconencted:", id);
    delete peers[id];
  });

  socket.on("adminMessage", (data) => {
    document.getElementById("adminMessageText").innerHTML = data.msg;
  });

  socket.on("mousePositions", (data) => {
    updateMousePositions(data);
  });

  // socket.on("chat", (data) => {
  //   let text = "";
  //   let messages = data.data;
  //   let container = document.getElementById("chatBox");
  //   for (let i = messages.length - 1; i >= 0; i--) {
  //     let msg = messages[i].msg;
  //     console.log(msg);
  //     text += msg + "\n\n";
  //   }
  //   container.innerText = text;

  //   let cc = document.getElementById("chatContainer");
  //   cc.scrollTop = cc.scrollHeight;
  // });

  // socket.on("showChat", (data) => {
  //   let container = document.getElementById("chat-column");
  //   let mainContainer = document.getElementById("main-content-box");
  //   if (data) {
  //     container.style.display = "";
  //     mainContainer.classList.remove("col-12");
  //     mainContainer.classList.add("col-10");
  //   } else {
  //     container.style.display = "none";
  //     mainContainer.classList.remove("col-10");
  //     mainContainer.classList.add("col-12");
  //   }
  // });

  // let chatInput = document.getElementById("chatMessageInput");
  // document.getElementById("sendChatButton").addEventListener("click", () => {
  //   sendChatMessage();
  // });
  // chatInput.addEventListener("keydown", (e) => {
  //   if (e.key == "Enter") {
  //     sendChatMessage();
  //   }
  // });

  // document.addEventListener("keydown", showLeftVideo);
  // document.addEventListener("keyup", showRightVideo);
  // document.addEventListener("keyup", (ev) => {
  //   if (ev.key === "1") {
  //     console.log("Sending OSC Message");
  //     socket.emit("osc", "/go");
  //   }
  // });

  // cameraPausedButton.addEventListener("click", () => {
  //   if (cameraPaused) {
  //     resumeVideo();
  //   } else {
  //     pauseVideo();
  //   }
  // });

  // microphonePausedButton.addEventListener("click", () => {
  //   if (micPaused) {
  //     resumeMic();
  //   } else {
  //     pauseMic();
  //   }
  // });

  // mediasoupPeer = new SimpleMediasoupPeer(socket);
  // console.log(mediasoupPeer);
  // mediasoupPeer.on("track", gotTrack);

  // updateCurrentScene();
  loop();
}
init();

// set up a loop which will repeat 60 times per second
function loop() {
    frameCount++;
    if (frameCount % 10) {
        socket.emit("mousePosition", mousePosition);
    }

    window.requestAnimationFrame(loop);
}

function handleInteractions(msg) {
  switch (msg.type) {
    default:
      console.log("not sure how to handle this: ", msg);
  }
}

function updateMousePositions(data) {
  for (let id in data) {
    const mousePosition = data[id].mousePosition;
    if (!mouseElements[id]) {
      mouseElements[id] = new MouseCursor();
    }
    if (mouseElements[id]) {
      mouseElements[id].move(mousePosition);
    }
  }
}

// visualization for a remove mouse cursor
class MouseCursor {
  constructor() {
    this.el = document.createElement("img");

    // choose a random image for this box
    this.el.src = mouseImageURLs[0];

    // apply some styling
    this.el.style.position = "absolute";
    this.el.style.width = "24px";
    this.el.style.height = "24px";

    // set it outside of the visible frame until we have an updated position
    this.el.style.top = "-100 px";
    this.el.style.left = "-100 px";

    // add it to the body
    document.body.appendChild(this.el);
  }

  move(position) {
    // put it in position
    this.el.style.top = position.y + "px";
    this.el.style.left = position.x + "px";
  }

  remove() {
    document.body.removeChild(this.el);
  }
}
