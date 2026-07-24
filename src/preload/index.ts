import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FetchMatchesOptions } from '../main/stratz/services/fetchMatches'
import type {
  SingleMatchContext,
  SessionMatchSummary,
  SessionReview
} from '../main/services/llmService'
import type { AppConfig } from '../main/config'
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

  getPlayGuide: (heroId: number): Promise<unknown> => ipcRenderer.invoke('get-play-guide', heroId),

  savePlayGuide: (heroId: number, slots: unknown[]): Promise<boolean> =>
    ipcRenderer.invoke('save-play-guide', heroId, slots),

  getLocalSteamId: (): Promise<{ steamId?: number; err?: string }> =>
    ipcRenderer.invoke('get-local-steam-id'),

  fetchMatchDetails: (matchId: string): Promise<unknown> =>
    ipcRenderer.invoke('fetch-match-details', matchId),

  fetchPlayerData: (steamId: string, forceRefresh = false): Promise<unknown> =>
    ipcRenderer.invoke('fetch-player-data', steamId, forceRefresh),
  fetchAllMatches: (steamId: string, options: FetchMatchesOptions = {}): Promise<unknown> =>
    ipcRenderer.invoke('fetch-all-matches', steamId, options),

  fetchHeroMatches: (
    steamId: string,
    heroId: number,
    skip?: number,
    take?: number
  ): Promise<unknown> => ipcRenderer.invoke('fetch-hero-matches', steamId, heroId, skip, take),

  triggerStartupSync: (steamId: number): Promise<void> =>
    ipcRenderer.invoke('trigger-startup-sync', steamId),

  startFullSync: (steamId: number): Promise<void> => ipcRenderer.invoke('start-full-sync', steamId),

  getSyncProgress: (steamId: number): Promise<{ synced: number; total: number; status: string }> =>
    ipcRenderer.invoke('get-sync-progress', steamId),

  onSyncProgress: (
    cb: (data: { synced: number; total: number; status: string }) => void
  ): (() => void) => {
    const handler = (
      _e: Electron.IpcRendererEvent,
      data: { synced: number; total: number; status: string }
    ): void => cb(data)
    ipcRenderer.on('sync-progress', handler)
    return () => ipcRenderer.removeListener('sync-progress', handler)
  },

  onSyncComplete: (cb: (data: { synced: number; total: number }) => void): (() => void) => {
    const handler = (
      _e: Electron.IpcRendererEvent,
      data: { synced: number; total: number }
    ): void => cb(data)
    ipcRenderer.on('sync-complete', handler)
    return () => ipcRenderer.removeListener('sync-complete', handler)
  },

  onMatchHistoryUpdated: (cb: () => void): (() => void) => {
    const handler = (): void => cb()
    ipcRenderer.on('match-history-updated', handler)
    return () => ipcRenderer.removeListener('match-history-updated', handler)
  },

  getHeroItemFrequency: (
    steamId: number,
    heroId: number
  ): Promise<{ itemId: number; count: number }[]> =>
    ipcRenderer.invoke('get-hero-item-frequency', steamId, heroId),

  getHeroTimings: (
    heroId: number,
    steamId: number
  ): Promise<{
    items: { itemId: number; avgTimeMin: number; winRate: number; matchCount: number }[]
    position: string | null
  }> => ipcRenderer.invoke('get-hero-timings', heroId, steamId),

  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('get-config'),

  setConfig: (config: Partial<AppConfig>): Promise<AppConfig> =>
    ipcRenderer.invoke('set-config', config),

  getStratzToken: (): Promise<string | null> => ipcRenderer.invoke('get-stratz-token'),
  setStratzToken: (token: string): Promise<boolean> =>
    ipcRenderer.invoke('set-stratz-token', token),

  getLlmConfig: (): Promise<{ configured: boolean; provider: string | null }> =>
    ipcRenderer.invoke('get-llm-config'),
  setLlmConfig: (config: {
    provider: string
    apiKey: string
    baseUrl?: string
  }): Promise<boolean> => ipcRenderer.invoke('set-llm-config', config),
  clearLlmConfig: (): Promise<boolean> => ipcRenderer.invoke('clear-llm-config'),

  generateCoaching: (ctx: SingleMatchContext): Promise<unknown> =>
    ipcRenderer.invoke('generate-coaching', ctx),
  generateSessionReview: (matches: SessionMatchSummary[]): Promise<SessionReview> =>
    ipcRenderer.invoke('generate-session-review', matches),

  onConfigUpdate: (cb: (config: unknown) => void): void => {
    ipcRenderer.on('config-updated', (_e, config) => cb(config))
  },

  onGuideUpdated: (cb: (heroId: number) => void): void => {
    ipcRenderer.on('guide-updated', (_e, heroId) => cb(heroId))
  },
  minimizeWindow: (): void => ipcRenderer.send('win-minimize'),
  maximizeWindow: (): void => ipcRenderer.send('win-maximize'),
  closeWindow: (): void => ipcRenderer.send('win-close'),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  showGuideNotification: (data: {
    itemName: string
    itemImg: string | null
    targetMinute: number
    acquiredAtClock: number
    diffSeconds: number
  }): void => ipcRenderer.send('show-guide-notification', data),

  onGuideNotification: (
    cb: (data: {
      itemName: string
      itemImg: string | null
      targetMinute: number
      acquiredAtClock: number
      diffSeconds: number
    }) => void
  ): void => {
    ipcRenderer.on('guide-notification-data', (_e, data) => cb(data))
  },

  getBenchmarks: (heroId: number): Promise<unknown> => ipcRenderer.invoke('get-benchmarks', heroId),

  requestParseMatch: (matchId: number): Promise<{ ok: boolean; err?: string }> =>
    ipcRenderer.invoke('request-parse-match', matchId)
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
