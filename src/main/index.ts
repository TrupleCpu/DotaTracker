import { app, BrowserWindow } from 'electron'
import { registerAssetProtocols, registerSchemesAsPrivileged } from './protocols/assetProtocols'
import http from 'http'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { startDraftEngine, stopDraftEngine } from './draft-engine/draftEngine'
import { createOverlayWindow } from './windows/overlayWindow'
import { createControlWindow } from './windows/controlWindow'
import { createTray } from './tray/tray'
import { registerIpcHandlers } from './ipc'
import { startTracking } from './tracking/overlayTracking'
import { createGSIServer } from './gsi-server'
import { state } from './state'

registerSchemesAsPrivileged()

let gsiServer: http.Server | null = null

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  registerAssetProtocols()

  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  startDraftEngine()
  createOverlayWindow()
  createControlWindow()
  createTray()
  registerIpcHandlers()
  startTracking()

  gsiServer = createGSIServer((ui) => {
    state.mainWindow?.webContents.send('dota-gsi-stream', ui)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createOverlayWindow()
  })
})

app.on('before-quit', () => {
  state.isQuitting = true
})

app.on('will-quit', () => {
  gsiServer?.close()
  stopDraftEngine()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
  }
})
