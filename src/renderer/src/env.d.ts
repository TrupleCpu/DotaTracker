/// <reference types="svelte" />
/// <reference types="vite/client" />
export {}

declare global {
  interface Window {
    api: {
      getLocalSteamId(): Promise<{ steamId: string | null; error?: string }>
      setConfig(config: { overlayEnabled: boolean }): Promise<void>
      getConfig(): Promise<{ overlayEnabled: boolean }>

      onGsiStream: (cb: (data: unknown) => void) => void

      steamLogin: () => Promise<string | null>

      fetchMatchHistory: (steamId: string) => Promise<unknown | { error: string }>
      fetchMatchDetails: (matchId: number) => Promise<unknown | { error: string }>

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
