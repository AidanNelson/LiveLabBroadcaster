// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  onOscMessage: (callback) =>
    ipcRenderer.on("osc-message", (_event, value) => callback(value)),
  counterValue: (value) => ipcRenderer.send("counter-value", value),
});

// window.addEventListener('DOMContentLoaded', () => {
//     // Remove existing CSP meta tags
//     const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
//     if (existingCSP) existingCSP.remove();

//     // Add updated CSP meta tag
//     const meta = document.createElement('meta');
//     meta.httpEquiv = 'Content-Security-Policy';
//     meta.content = "default-src 'self' 'unsafe-inline' data:; connect-src 'self' https://backend.sheepdog.work";
//     document.head.appendChild(meta);
//   });
