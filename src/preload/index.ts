import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FetchMatchesOptions } from '../main/stratz/services/fetchMatches'
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

  fetchPlayerData: (steamId: string, forceRefresh = false): Promise<unknown> =>
    ipcRenderer.invoke('fetch-player-data', steamId, forceRefresh),
  fetchAllMatches: (steamId: string, options: FetchMatchesOptions = {}): Promise<unknown> =>
    ipcRenderer.invoke('fetch-all-matches', steamId, options),

  fetchHeroMatches: (steamId: string, heroId: number, skip?: number, take?: number): Promise<any> =>
    ipcRenderer.invoke('fetch-hero-matches', steamId, heroId, skip, take),

  triggerStartupSync: (steamId: string): Promise<void> =>
    ipcRenderer.invoke('trigger-startup-sync', steamId),

  startFullSync: (steamId: number): Promise<void> =>
    ipcRenderer.invoke('start-full-sync', steamId),

  getSyncProgress: (steamId: number): Promise<{ synced: number; total: number; status: string }> =>
    ipcRenderer.invoke('get-sync-progress', steamId),

  onSyncProgress: (cb: (data: { synced: number; total: number; status: string }) => void): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: { synced: number; total: number; status: string }) => cb(data)
    ipcRenderer.on('sync-progress', handler)
    return () => ipcRenderer.removeListener('sync-progress', handler)
  },

  onSyncComplete: (cb: (data: { synced: number; total: number }) => void): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: { synced: number; total: number }) => cb(data)
    ipcRenderer.on('sync-complete', handler)
    return () => ipcRenderer.removeListener('sync-complete', handler)
  },

  onMatchHistoryUpdated: (cb: () => void): (() => void) => {
    const handler = () => cb()
    ipcRenderer.on('match-history-updated', handler)
    return () => ipcRenderer.removeListener('match-history-updated', handler)
  },

  getHeroItemFrequency: (steamId: number, heroId: number): Promise<{ itemId: number; count: number }[]> =>
    ipcRenderer.invoke('get-hero-item-frequency', steamId, heroId),

  getHeroTimings: (heroId: number, steamId: number): Promise<{ items: { itemId: number; avgTimeMin: number; winRate: number; matchCount: number }[]; position: string | null }> =>
    ipcRenderer.invoke('get-hero-timings', heroId, steamId),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConfig: (): Promise<any> => ipcRenderer.invoke('get-config'),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setConfig: (config: any): Promise<any> => ipcRenderer.invoke('set-config', config),

  getStratzToken: (): Promise<string | null> => ipcRenderer.invoke('get-stratz-token'),
  setStratzToken: (token: string): Promise<boolean> => ipcRenderer.invoke('set-stratz-token', token),

  getLlmConfig: (): Promise<{ configured: boolean; provider: string | null }> =>
    ipcRenderer.invoke('get-llm-config'),
  setLlmConfig: (config: { provider: string; apiKey: string; baseUrl?: string }): Promise<boolean> =>
    ipcRenderer.invoke('set-llm-config', config),
  clearLlmConfig: (): Promise<boolean> => ipcRenderer.invoke('clear-llm-config'),

  generateCoaching: (ctx: any): Promise<any> => ipcRenderer.invoke('generate-coaching', ctx),
  generateSessionReview: (matches: any[]): Promise<any> => ipcRenderer.invoke('generate-session-review', matches),

  onConfigUpdate: (): void => ipcRenderer.send('win-minimize'),
  maximizeWindow: (): void => ipcRenderer.send('win-maximize'),
  closeWindow: (): void => ipcRenderer.send('win-close'),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version')
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
