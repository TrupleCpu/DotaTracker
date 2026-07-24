import { app, BrowserWindow, globalShortcut, session } from 'electron'
import { registerAssetProtocols, registerSchemesAsPrivileged } from './protocols/assetProtocols'
import http from 'http'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createOverlayWindow } from './windows/overlayWindow'
import { createControlWindow } from './windows/controlWindow'
import { createGuideNotificationWindow } from './windows/guideNotificationWindow'
import { createTray } from './tray/tray'
import { registerIpcHandlers } from './ipc'
import { startTracking } from './tracking/overlayTracking'
import { createGSIServer } from './gsi-server'
import { state } from './state'
import { initDatabase } from './db'

registerSchemesAsPrivileged()

const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: hero-asset: hero-model: item-asset: ability-asset: https://avatars.steamstatic.com https://steamcdn-a.akamaihd.net; connect-src 'self'; font-src 'self' data:; object-src 'none'; media-src 'none';"

let gsiServer: http.Server | null = null

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP]
      }
    })
  })

  initDatabase()
  registerAssetProtocols()

  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  createOverlayWindow()
  createControlWindow()
  createGuideNotificationWindow()
  createTray()
  registerIpcHandlers()

  globalShortcut.register('CmdOrCtrl+Shift+D', () => {
    const win = state.controlWindow
    if (!win) return
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })

  startTracking()

  gsiServer = createGSIServer((ui) => {
    state.mainWindow?.webContents.send('dota-gsi-stream', ui)
    state.controlWindow?.webContents.send('dota-gsi-stream', ui)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createOverlayWindow()
  })
})

app.on('before-quit', () => {
  state.isQuitting = true
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  gsiServer?.close()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
