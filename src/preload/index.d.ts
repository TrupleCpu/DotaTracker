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
      getConfig: () => Promise<unknown>
      setConfig: (config: unknown) => Promise<unknown>
      onConfigUpdate: (cb: (config: unknown) => void) => void
      onDraftUpdate: (cb: (data: DraftState) => void) => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
    }
  }
}
