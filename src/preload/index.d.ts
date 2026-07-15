import { ElectronAPI } from '@electron-toolkit/preload'

export interface DraftHero {
  id: number
  key: string
  name: string
  confidence: number
}

export interface DraftState {
  Radiant: (DraftHero | null)[]
  Dire: (DraftHero | null)[]
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      toggleOverlay: () => void
      setOverlayState: (enabled: boolean) => Promise<boolean>
      getOverlayStatus: () => Promise<boolean>
      onOverlayStatus: (cb: (visible: boolean) => void) => void
      onGsiStream: (cb: (data: unknown) => void) => void
      steamLogin: () => Promise<string>
      getLocalSteamId: () => Promise<{ steamId?: string; error?: string }>
      fetchMatchHistory: (steamId: string) => Promise<unknown>
      fetchMatchDetails: (matchId: string) => Promise<unknown>
      fetchPlayerData: (steamId: string) => Promise<unknown>
      fetchAllMatches: (steamId: string, options?: unknown) => Promise<unknown>
      fetchHeroMatches: (steamId: string, heroId: number, skip?: number, take?: number) => Promise<any>
      analyzeHeroMatchups: (heroId: number) => Promise<any>
      analyzeDraftWinProbability: (radiantIds: number[], direIds: number[]) => Promise<any>
      triggerStartupSync: (steamId: string) => Promise<void>
      startFullSync: (steamId: number) => Promise<void>
      getSyncProgress: (steamId: number) => Promise<{ synced: number; total: number; status: string }>
      onSyncProgress: (cb: (data: { synced: number; total: number; status: string }) => void) => void
      onSyncComplete: (cb: (data: { synced: number; total: number }) => void) => void
      onMatchHistoryUpdated: (cb: () => void) => void
      getHeroItemFrequency: (steamId: number, heroId: number) => Promise<{ itemId: number; count: number }[]>
      getHeroTimings: (heroId: number, steamId: number) => Promise<{ items: { itemId: number; avgTimeMin: number; winRate: number; matchCount: number }[]; position: string | null }>
      getConfig: () => Promise<unknown>
      setConfig: (config: unknown) => Promise<unknown>
      onConfigUpdate: (cb: (config: unknown) => void) => void
      onDraftUpdate: (cb: (data: DraftState) => void) => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      getAppVersion: () => Promise<string>
    }
  }
}
