/// <reference types="svelte" />
/// <reference types="vite/client" />
export {}

interface FetchMatchesOptions {
  take?: number
  skip?: number
  gameModeIds?: number[] | string[]
  lobbyTypeIds?: number[]
  bracketIds?: number[]
  positionIds?: string[]
  isParty?: boolean
}

declare global {
  interface Window {
    api: {
      getLocalSteamId(): Promise<{ steamId: string | null; error?: string }>
      setConfig(config: { overlayEnabled: boolean }): Promise<void>
      getConfig(): Promise<{ overlayEnabled: boolean }>
      
      getStratzToken(): Promise<string | null>
      setStratzToken(token: string): Promise<boolean>

      onGsiStream: (cb: (data: unknown) => void) => void

      steamLogin: () => Promise<string | null>

      fetchMatchHistory: (steamId: string) => Promise<unknown | { error: string }>
      fetchPlayerData: (steamId: string) => Promise<any>
      fetchMatchDetails: (matchId: string) => Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchAllMatches: (steamId: string, options?: any) => Promise<any>
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchHeroMatches: (steamId: string, heroId: number, skip?: number, take?: number) => Promise<any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analyzeHeroMatchups: (heroId: number) => Promise<any>
      analyzeDraftWinProbability: (radiantIds: number[], direIds: number[]) => Promise<{radiantProb: number, direProb: number}>
      triggerStartupSync: (steamId: string) => Promise<void>

      toggleOverlay: () => void
      setOverlayState: (enabled: boolean) => Promise<boolean>
      getOverlayStatus: () => Promise<boolean>
      onOverlayStatus: (cb: (visible: boolean) => void) => void
      
      minimizeWindow(): void
      maximizeWindow(): void
      closeWindow(): void
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
