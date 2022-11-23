console.log("ok");

let peers = {};
let frameCount = 0;
let visibleInteractions = {
  mouse: false,
};

// set up a loop which will repeat 60 times per second
function loop() {
  frameCount++;

  // emit updates to our mouse position here (at whichever frequency makes sense)
  if (frameCount % 30) {
    socket.emit("mousePosition", mousePosition);
  }

  for (let i = fallingKeys.length - 1; i >= 0; i--) {
    const key = fallingKeys[i];
    const isAlive = key.update();
    if (!isAlive) {
      fallingKeys.splice(i, 1);
    }
  }

  window.requestAnimationFrame(loop);
}

function handleInteractions(msg) {
  switch (msg.type) {
    case "realTimeText":
      console.log(msg.data);
      fallingKeys.push(new FallingKey(msg.data));
      break;

    default:
      console.log("not sure how to handle this: ", msg);
  }
}

/*
Mouse Interactions
This code relates to sharing mouse position.
*/
// our mouse position
let mousePosition = { x: -100, y: -100 };

const mouseImageURLs = [new URL("./assets/white-square.png", import.meta.url)];
// add mouse button interaction
let mouseButton = document.getElementById("mouseInteractionButton");

mouseButton.addEventListener("click", (ev) => {
  visibleInteractions.mouse = !visibleInteractions.mouse;
  for (let id in peers) {
    peers[id].cursor.toggleVisibility(visibleInteractions.mouse);
  }
  mouseButton.innerText = visibleInteractions.mouse ? "Hide 🐭!" : "Show 🐭!";
  console.log("currently visible interactions: ", visibleInteractions);
});

// update our mouse position whenever we move the pointern
document.addEventListener("pointermove", (ev) => {
  mousePosition = { x: ev.pageX, y: ev.pageY };
});

// update based on data from server
function updateMousePositions(data) {
  for (let id in data) {
    const mousePosition = data[id].mousePosition;
    if (!(id in peers)) continue;
    const cursor = peers[id].cursor;
    cursor.move(mousePosition);
  }
}

// visualization for a remove mouse cursor
class MouseCursor {
  constructor() {
    this.el = document.createElement("p");

    // choose a random image for this box
    // this.el.src = mouseImageURLs[0];
    this.el.innerText = "🐭";

    // apply some styling
    this.el.style.position = "absolute";
    this.el.style.width = "12px";
    this.el.style.height = "12px";

    // set it outside of the visible frame until we have an updated position
    this.el.style.top = "-100 px";
    this.el.style.left = "-100 px";

    // add it to the body
    document.body.appendChild(this.el);
    this.toggleVisibility(false);
  }

  move(position) {
    // put it in position
    this.el.style.top = position.y + "px";
    this.el.style.left = position.x + "px";
  }

  toggleVisibility(visible) {
    this.el.style.display = visible ? "block" : "none";
  }

  remove() {
    document.body.removeChild(this.el);
  }
}

// Set up everything we need for a new peer
function createPeer() {
  return { cursor: new MouseCursor() };
}

/*
Text Interaction

*/
const fallingKeys = [];
const textInput = document.getElementById("textInteractionInput");
const textButton = document.getElementById("textInteractionButton");

textInput.addEventListener("keypress", (ev) => {
  console.log(textInput.value);
  console.log(ev);
  socket.emit("interaction", { type: "realTimeText", data: ev.key });
});

class FallingKey {
  constructor(text) {
    this.el = document.createElement("p");

    this.lifeForce = 1000 + Math.random() * 1000;
    this.position = {
      x: Math.random() * window.innerWidth,
      y: -100,
    };

    // choose a random image for this box
    // this.el.src = mouseImageURLs[0];
    this.el.innerText = text;

    // apply some styling
    this.el.style.position = "absolute";
    this.el.style.width = "12px";
    this.el.style.height = "12px";

    // set it outside of the visible frame until we have an updated position
    let top = this.position.y + "px";
    let left = this.position.x + "px";
    this.el.style.top = top;
    this.el.style.left = left;

    // add it to the body
    document.body.appendChild(this.el);
  }

  update() {
    // fall from the sky
    this.position.y += 1;

    // set it outside of the visible frame until we have an updated position
    let top = this.position.y + "px";
    let left = this.position.x + "px";
    this.el.style.top = top;
    this.el.style.left = left;

    this.lifeForce--;
    if (this.lifeForce < 0) {
      this.remove();
      return false;
    } else {
      return true;
    }
  }

  remove() {
    document.body.removeChild(this.el);
  }
}
/*
Initialization
 
This function establishes a socket connection with the server and sets up event handlers for various 
incoming socket messages

*/

window.onload = () => {
  console.log("~~~~~~~~~~~~~~~~~");
  socket = io("http://localhost:8080", {
    path: "/socket.io",
  });
  socket.on("connection", () => {
    console.log("connected!");
  });

  // generic interaction socket event for ease of setting up new interactions
  // new interactions should be set up as follows: {type: 'myEventType', data: myCoolData}
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
        peers[id] = createPeer();
      }
    }
  });

  socket.on("clientConnected", (id) => {
    console.log("Client conencted: ", id);
    peers[id] = createPeer();
  });

  socket.on("clientDisconnected", (id) => {
    console.log("Client disconencted:", id);
    if (!(id in peers)) return;
    peers[id].cursor.remove();
    delete peers[id];
  });

  // socket handler for mouse position info from the server
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

  loop();
};
