import { ipcMain } from "electron"
import { state } from "../state"
import { saveConfig } from "../config"
import { getStratzToken, saveStratzToken } from "../tokenStore"

export function registerConfigHandlers(): void {
  ipcMain.handle('get-config', () => {
    return state.config
  })

  ipcMain.handle('set-config', (_event, newConfig) => {
    state.config = { ...state.config, ...newConfig }
    saveConfig(state.config)

    // broadcast update
    if (state.controlWindow) {
      state.controlWindow.webContents.send('config-updated', state.config)
    }

    return state.config
  })

  ipcMain.handle('get-stratz-token', () => {
    return getStratzToken()
  })

  ipcMain.handle('set-stratz-token', (_event, token: string) => {
    saveStratzToken(token)
    return true
  })
}
