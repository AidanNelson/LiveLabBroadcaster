// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  onOscMessage: (callback) => ipcRenderer.on('osc-message', (_event, value) => callback(value)),
  counterValue: (value) => ipcRenderer.send('counter-value', value)
})