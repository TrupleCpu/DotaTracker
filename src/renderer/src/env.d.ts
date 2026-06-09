/// <reference types="svelte" />
/// <reference types="vite/client" />
export {}

import type { OpenDotaMatch, DetailedMatchData } from './src/renderer/types/dota'

declare global {
  interface Window {
    api: {
      getLocalSteamId(): Promise<{ steamId: string | null; error?: string }>
      setConfig(config: { overlayEnabled: boolean }): Promise<void>
      getConfig(): Promise<{ overlayEnabled: boolean }>

      onGsiStream: (cb: (data: unknown) => void) => void

      steamLogin: () => Promise<string | null>

      fetchMatchHistory: (steamId: string) => Promise<OpenDotaMatch[] | { error: string }>
      fetchMatchDetails: (matchId: number) => Promise<DetailedMatchData | { error: string }>

      toggleOverlay: () => void
      setOverlayState: (enabled: boolean) => Promise<boolean>
      getOverlayStatus: () => Promise<boolean>
      onOverlayStatus: (cb: (visible: boolean) => void) => void
    }

    electron: {
      process: {
        versions: {
          electron: string
          chrome: string
          node: string
        }
      }
    }
  }
}
