import { ipcMain } from 'electron'

export function registerSteamHandlers(): void {
  ipcMain.handle('get-local-steam-id', async () => {
    // const platform = os.platform()

    // if (platform === 'win32') {
    //   return new Promise((resolve) => {
    //     exec(
    //       'reg query "HKCU\\Software\\Valve\\Steam\\ActiveProcess" /v ActiveUser',
    //       (err, stdout) => {
    //         if (err) return resolve({ error: 'Steam registry branch missing.' })
    //         const match = stdout.match(/ActiveUser\s+REG_DWORD\s+(0x[0-9a-fA-F]+)/)

    //         if (match && match[1]) {
    //           const accountId = parseInt(match[1], 16)
    //           if (accountId === 0) return resolve({ error: 'Steam is open but no user is active.' })
    //           resolve({ steamId: accountId })
    //         } else {
    //           resolve({ error: 'Failed to read registry output.' })
    //         }
    //       }
    //     )
    //   })
    // }

    // if (platform === 'linux') {
    //   try {
    //     const home = os.homedir()
    //     const paths = [
    //       join(home, '.steam/steam/config/loginusers.vdf'),
    //       join(home, '.local/share/Steam/config/loginusers.vdf')
    //     ]

    //     let vdfContent = ''
    //     for (const p of paths) {
    //       if (fs.existsSync(p)) {
    //         vdfContent = fs.readFileSync(p, 'utf-8')
    //         break
    //       }
    //     }

    //     if (!vdfContent) return { error: 'Steam config files unreachable' }
    //     const userBlocks = vdfContent.match(/"\d{17}"\s*\{[^}]+\}/g)
    //     if (userBlocks) {
    //       for (const block of userBlocks) {
    //         if (block.includes('"MostRecent"') && block.includes('"1"')) {
    //           const idMatch = block.match(/"(\d{17})"/)
    //           if (idMatch) return { steamId: idMatch[1].toString() }
    //         }
    //       }
    //     }
    //     return { error: 'No recent active session detected' }
    //   } catch (err) {
    //     return { error: 'Failed to crawl local config architecture.' }
    //   }
    // }

    return { steamId: 996783386 }
  })
}
