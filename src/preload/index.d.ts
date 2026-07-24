import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      toggleOverlay: () => void
      setOverlayState: (enabled: boolean) => Promise<boolean>
      getOverlayStatus: () => Promise<boolean>
      onOverlayStatus: (cb: (visible: boolean) => void) => void
      onGsiStream: (cb: (data: unknown) => void) => void
      getPlayGuide: (heroId: number) => Promise<unknown>
      savePlayGuide: (heroId: number, slots: unknown[]) => Promise<boolean>
      getLocalSteamId: () => Promise<{ steamId?: string; error?: string }>
      fetchMatchDetails: (matchId: number | string) => Promise<unknown>
      fetchPlayerData: (steamId: string, forceRefresh?: boolean) => Promise<unknown>
      fetchAllMatches: (steamId: string, options?: unknown) => Promise<unknown>
      fetchHeroMatches: (
        steamId: string,
        heroId: number,
        skip?: number,
        take?: number
      ) => Promise<unknown>
      triggerStartupSync: (steamId: string) => Promise<void>
      startFullSync: (steamId: number) => Promise<void>
      getSyncProgress: (
        steamId: number
      ) => Promise<{ synced: number; total: number; status: string }>
      onSyncProgress: (
        cb: (data: { synced: number; total: number; status: string }) => void
      ) => () => void
      onSyncComplete: (cb: (data: { synced: number; total: number }) => void) => () => void
      onMatchHistoryUpdated: (cb: () => void) => () => void
      getHeroItemFrequency: (
        steamId: number,
        heroId: number
      ) => Promise<{ itemId: number; count: number }[]>
      getHeroTimings: (
        heroId: number,
        steamId: number
      ) => Promise<{
        items: { itemId: number; avgTimeMin: number; winRate: number; matchCount: number }[]
        position: string | null
      }>
      getConfig: () => Promise<{ autoSyncMatches?: boolean }>
      setConfig: (config: unknown) => Promise<unknown>
      onConfigUpdate: (cb: (config: unknown) => void) => void
      onGuideUpdated: (cb: (heroId: number) => void) => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      getAppVersion: () => Promise<string>
      showGuideNotification: (data: {
        itemName: string
        itemImg: string | null
        targetMinute: number
        acquiredAtClock: number
        diffSeconds: number
      }) => void
      onGuideNotification: (
        cb: (data: {
          itemName: string
          itemImg: string | null
          targetMinute: number
          acquiredAtClock: number
          diffSeconds: number
        }) => void
      ) => void
      getBenchmarks: (heroId: number) => Promise<unknown>
      getStratzToken: () => Promise<string | null>
      setStratzToken: (token: string) => Promise<boolean>
      getLlmConfig: () => Promise<{ configured: boolean; provider: string | null; model?: string }>
      setLlmConfig: (config: {
        provider: string
        apiKey: string
        baseUrl?: string
        model: string
      }) => Promise<boolean>
      clearLlmConfig: () => Promise<boolean>
      generateCoaching: (ctx: unknown) => Promise<{ err?: string } | null>
      generateSessionReview: (matches: unknown[]) => Promise<unknown>
    }
  }
}
