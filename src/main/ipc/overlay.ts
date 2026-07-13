import { ipcMain } from 'electron'
import { state } from '../state'
import { saveConfig } from '../config'

export function registerOverlayHandlers(): void {
  ipcMain.handle('get-overlay-status', () => state.config.overlayEnabled ?? true)

  ipcMain.on('toggle-overlay', () => {
    const enabled = !state.config.overlayEnabled
    state.config.overlayEnabled = enabled
    saveConfig(state.config)
    applyOverlayVisibility(enabled)
  })

  ipcMain.handle('set-overlay-state', (_e, enabled: true) => {
    state.config.overlayEnabled = enabled
    saveConfig(state.config)
    applyOverlayVisibility(enabled)
    return state.config.overlayEnabled
  })
}

function applyOverlayVisibility(enabled: boolean): void {
  if (state.mainWindow && !state.mainWindow.isDestroyed()) {
    enabled ? state.mainWindow.showInactive() : state.mainWindow.hide()
  }

  if (state.controlWindow && !state.controlWindow.isDestroyed()) {
    state.controlWindow.webContents.send('config-updated', state.config)
    state.controlWindow.webContents.send('overlay-status', enabled)
  }
}
