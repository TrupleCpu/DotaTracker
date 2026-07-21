import { ipcMain } from 'electron'
import os from 'os'
import { exec } from 'child_process'

type ActiveSteamTypes =
  | {
      steamId: number
    }
  | {
      err: string
    }

export async function getActiveSteamId(): Promise<ActiveSteamTypes> {
  const platform = os.platform()

  if (platform === 'win32') {
    return new Promise<ActiveSteamTypes>((resolve) => {
      exec(
        'reg query "HKCU\\Software\\Valve\\Steam\\ActiveProcess" /v ActiveUser',
        (err, stdout) => {
          if (err) {
            return resolve({ err: 'Steam registry branch missing.' })
          }

          const match = stdout.match(/ActiveUser\s+REG_DWORD\s+(0x[0-9a-fA-F]+)/)

          if (match?.[1]) {
            const accountId = parseInt(match[1], 16)

            if (accountId === 0) {
              return resolve({
                err: 'Steam is open but no user is active.'
              })
            }

            return resolve({ steamId: accountId })
          }

          resolve({ err: 'Failed to read registry output.' })
        }
      )
    })
  }

  return {
    err: 'Unsupported operating system.'
  }
}

export function registerSteamHandlers(): void {
  ipcMain.handle('get-local-steam-id', async () => {
    const result = await getActiveSteamId()

    if ('err' in result) {
      return result
    }

    return result
  })
}
