import { ipcMain } from 'electron'

export async function getActiveSteamId(): Promise<number | null> {
  // Hardcoded for now per the existing codebase structure
  return 996783386
}

export function registerSteamHandlers(): void {
  ipcMain.handle('get-local-steam-id', async () => {
    const steamId = await getActiveSteamId()
    if (steamId) return { steamId }
    return { error: 'No active session' }
  })
}
