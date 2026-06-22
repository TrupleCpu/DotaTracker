import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  toggleOverlay: (): void => ipcRenderer.send('toggle-overlay'),

  setOverlayState: (enabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke('set-overlay-state', enabled),
  getOverlayStatus: (): Promise<boolean> => ipcRenderer.invoke('get-overlay-status'),

  onOverlayStatus: (cb: (visible: boolean) => void): void => {
    ipcRenderer.on('overlay-status', (_e, v) => cb(v))
  },

  onGsiStream: (cb: (data: unknown) => void): void => {
    ipcRenderer.on('dota-gsi-stream', (_e, data) => cb(data))
  },

  steamLogin: (): Promise<string> => ipcRenderer.invoke('steam-login'),

  getLocalSteamId: (): Promise<{ steamId?: string; error?: string }> =>
    ipcRenderer.invoke('get-local-steam-id'),

  fetchMatchHistory: (steamId: string): Promise<unknown> =>
    ipcRenderer.invoke('fetch-match-history', steamId),

  fetchMatchDetails: (matchId: string): Promise<unknown> =>
    ipcRenderer.invoke('fetch-match-details', matchId),

  // ✅ NEW: CONFIG SYSTEM
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConfig: (): Promise<any> => ipcRenderer.invoke('get-config'),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setConfig: (config: any): Promise<any> => ipcRenderer.invoke('set-config', config),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfigUpdate: (cb: (config: any) => void): void => {
    ipcRenderer.on('config-updated', (_e, data) => cb(data))
  },

  minimizeWindow: (): void => ipcRenderer.send('win-minimize'),
  maximizeWindow: (): void => ipcRenderer.send('win-maximize'),
  closeWindow: (): void => ipcRenderer.send('win-close')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
