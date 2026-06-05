/// <reference types="svelte" />
/// <reference types="vite/client" />
export {}

declare global {
  interface Window {
    api: {
      getLocalSteamId(): unknown
      setConfig(config: { overlayEnabled: boolean }): unknown
      getConfig(): Promise<{ overlayEnabled: boolean }>

      onGsiStream: (cb: (data: unknown) => void) => void

      steamLogin: () => Promise<string | null>

      fetchMatchHistory: (steamId: string) => Promise<unknown>

      toggleOverlay: () => void
      getOverlayStatus: () => Promise<boolean>

      onOverlayStatus: (cb: (visible: boolean) => void) => void
    }

    electron: unknown
  }
}