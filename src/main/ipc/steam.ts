import { ipcMain } from 'electron'
import os from 'os'
import { exec } from 'child_process'

type ActiveSteamTypes =
  | {
      steamId: number
    }
  | {
      error: string
    }

export async function getActiveSteamId(): Promise<ActiveSteamTypes> {
  const platform = os.platform()

  if (platform === 'win32') {
    return new Promise<ActiveSteamTypes>((resolve) => {
      exec(
        'reg query "HKCU\\Software\\Valve\\Steam\\ActiveProcess" /v ActiveUser',
        (err, stdout) => {
          if (err) {
            return resolve({ error: 'Steam registry branch missing.' })
          }

          const match = stdout.match(/ActiveUser\s+REG_DWORD\s+(0x[0-9a-fA-F]+)/)

          if (match?.[1]) {
            const accountId = parseInt(match[1], 16)

            if (accountId === 0) {
              return resolve({
                error: 'Steam is open but no user is active.'
              })
            }

            return resolve({ steamId: accountId })
          }

          resolve({ error: 'Failed to read registry output.' })
        }
      )
    })
  }

  return {
    error: 'Unsupported operating system.'
  }
}

export function registerSteamHandlers(): void {
  ipcMain.handle('get-local-steam-id', async () => {
    const result = await getActiveSteamId()

    if ('error' in result) {
      return result
    }

    return result
  })
}
