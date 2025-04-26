const { app, BrowserWindow, session } = require("electron");
const path = require("node:path");
var osc = require("osc");

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const startOSCServer = () => {
  // Create an osc.js UDP Port listening on port 57121.
  var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121,
    metadata: true,
  });

  // Listen for incoming OSC messages.
  udpPort.on("message", function (oscMsg, timeTag, info) {
    console.log("An OSC message just arrived!", oscMsg);

    mainWindow.webContents.send("osc-message", oscMsg);
  });

  // Open the socket.
  udpPort.open();

  console.log("OSC server is running on port 57121\n");

  // When the port is read, send an OSC message to, say, SuperCollider
  udpPort.on("ready", function () {
    udpPort.send(
      {
        address: "/s_new",
        args: [
          {
            type: "s",
            value: "default",
          },
          {
            type: "i",
            value: 100,
          },
        ],
      },
      "127.0.0.1",
      57110,
    );
  });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' https://backend.sheepdog.work ws: wss:",
        ],
      },
    });
  });
  createWindow();
  startOSCServer();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
