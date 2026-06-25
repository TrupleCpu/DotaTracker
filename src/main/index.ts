import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { windowManager } from 'node-window-manager'
import { createGSIServer } from './gsi-server'
import { loadConfig, saveConfig } from './config'
import http from 'http'
import { getPlayerData } from './services/stratzService'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'

const WIDGET_WIDTH = 250
const WIDGET_HEIGHT = 90
const CONTROL_WIDTH = 1200
const CONTROL_HEIGHT = 900

let mainWindow: BrowserWindow | null = null
let controlWindow: BrowserWindow | null = null
let tray: Tray | null = null
let gsiServer: http.Server | null = null
let config = loadConfig()

type DotaBoundsProps = {
  x: number
  y: number
  height: number
  width: number
}

function createOverlayWindow(): void {
  mainWindow = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    focusable: false,
    fullscreenable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setIgnoreMouseEvents(true, { forward: true })
  mainWindow.setSkipTaskbar(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createControlWindow(): void {
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.focus()
    return
  }

  controlWindow = new BrowserWindow({
    width: CONTROL_WIDTH,
    height: CONTROL_HEIGHT,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  controlWindow.once('ready-to-show', () => {
    controlWindow?.show()
  })

  controlWindow.on('closed', () => {
    controlWindow = null
  })

  const devURL = process.env['ELECTRON_RENDERER_URL']

  if (is.dev && devURL) {
    // ✅ CONTROL VIEW
    controlWindow.loadURL(`${devURL}?view=control`)
  } else {
    controlWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { view: 'control' }
    })
  }
}

function createTray(): void {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Control Panel', click: (): void => createControlWindow() },
    { type: 'separator' },
    { label: 'Quit', click: (): void => app.quit() }
  ])

  tray.setToolTip('Dota 2 Tracker')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    createControlWindow()
  })
}

function toggleOverlay(): void {
  const nextState = !config.overlayEnabled

  config.overlayEnabled = nextState
  saveConfig(config)

  if (mainWindow && !mainWindow.isDestroyed()) {
    if (nextState) {
      mainWindow.showInactive()
    } else {
      mainWindow.hide()
    }
  }

  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send('config-updated', config)
    controlWindow.webContents.send('overlay-status', nextState)
  }
}

function getSafeBounds(activeWindow: {
  getBounds: () => { x: number; y: number; width: number; height: number } | null
}): DotaBoundsProps | null {
  try {
    const raw = activeWindow.getBounds?.()
    if (!raw) return null

    const bounds: DotaBoundsProps = {
      x: Math.floor(raw.x),
      y: Math.floor(raw.y),
      width: Math.floor(raw.width),
      height: Math.floor(raw.height)
    }
    return bounds
  } catch (err) {
    console.error('Failed to get safe bounds:', err)
    return null
  }
}

function startTracking(): void {
  setInterval(() => {
    try {
      if (!config.overlayEnabled) {
        if (mainWindow?.isVisible()) mainWindow.hide()
        return
      }

      const activeWindow = windowManager.getActiveWindow()
      const title = activeWindow?.getTitle() || ''

      if (title.toLowerCase().includes('dota 2')) {
        const bounds = getSafeBounds(
          activeWindow as unknown as {
            getBounds: () => { x: number; y: number; width: number; height: number } | null
          }
        )
        if (bounds && mainWindow) {
          // Bottom-left logic for 1080p
          // Adjust if user resolution is different
          const x = bounds.x + 8
          const y = bounds.y + 125

          mainWindow.setBounds({
            x,
            y,
            width: WIDGET_WIDTH,
            height: WIDGET_HEIGHT
          })
        }

        if (mainWindow && !mainWindow.isVisible()) {
          mainWindow.showInactive()
          mainWindow.setAlwaysOnTop(true, 'screen-saver')
        }
      } else {
        if (mainWindow && mainWindow.isVisible()) {
          mainWindow.hide()
        }
      }
    } catch (err) {
      console.error('Overlay visibility check error:', err)
    }
  }, 100)
}

function registerIpcHandlers(): void {
  ipcMain.handle('get-overlay-status', () => config.overlayEnabled ?? true)

  ipcMain.on('toggle-overlay', () => {
    toggleOverlay()
  })

  ipcMain.handle('set-overlay-state', (_event, enabled: boolean) => {
    config.overlayEnabled = enabled
    saveConfig(config)

    if (mainWindow && !mainWindow.isDestroyed()) {
      if (enabled) {
        mainWindow.showInactive()
      } else {
        mainWindow.hide()
      }
    }

    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.webContents.send('config-updated', config)
    }

    return config.overlayEnabled
  })

  ipcMain.handle('get-local-steam-id', async () => {
    const platform = os.platform()

    if (platform === 'win32') {
      return new Promise((resolve) => {
        exec(
          'reg query "HKCU\\Software\\Valve\\Steam\\ActiveProcess" /v ActiveUser',
          (err, stdout) => {
            if (err) return resolve({ error: 'Steam registry branch missing.' })
            const match = stdout.match(/ActiveUser\s+REG_DWORD\s+(0x[0-9a-fA-F]+)/)

            if (match && match[1]) {
              const accountId = parseInt(match[1], 16)
              if (accountId === 0) return resolve({ error: 'Steam is open but no user is active.' })
              resolve({ steamId: accountId.toString() })
            } else {
              resolve({ error: 'Failed to read registry output.' })
            }
          }
        )
      })
    }

    if (platform === 'linux') {
      try {
        const home = os.homedir()
        const paths = [
          join(home, '.steam/steam/config/loginusers.vdf'),
          join(home, '.local/share/Steam/config/loginusers.vdf')
        ]

        let vdfContent = ''
        for (const p of paths) {
          if (fs.existsSync(p)) {
            vdfContent = fs.readFileSync(p, 'utf-8')
            break
          }
        }

        if (!vdfContent) return { error: 'Steam config files unreachable' }
        const userBlocks = vdfContent.match(/"\d{17}"\s*\{[^}]+\}/g)
        if (userBlocks) {
          for (const block of userBlocks) {
            if (block.includes('"MostRecent"') && block.includes('"1"')) {
              const idMatch = block.match(/"(\d{17})"/)
              if (idMatch) return { steamId: idMatch[1].toString() }
            }
          }
        }
        return { error: 'No recent active session detected' }
      } catch (err) {
        return { error: 'Failed to crawl local config architecture.' }
      }
    }

    return { error: 'Unsupported platform' }
  })

  ipcMain.handle('fetch-match-history', async (_event, steamId32: string) => {
    try {
      const url = `https://api.opendota.com/api/players/${steamId32}/matches?limit=20`

      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`OpenDota responded with status code: ${res.status}`)
      }

      const matches = await res.json()

      return matches
    } catch (err) {
      console.error('OpenDota fetch failure:', err)
      return { error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('fetch-match-details', async (_event, matchId: string | number) => {
    try {
      const url = `https://api.opendota.com/api/matches/${matchId}`
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`OpenDota match API responded with status: ${res.status}`)
      }

      const details = await res.json()
      return details
    } catch (err) {
      console.error(`OpenDota detailed fetch failure for match ${matchId}:`, err)
      return { error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('fetch-player-data', async (_event, steamId32: string | number) => {
    try {
      return await getPlayerData(steamId32)
    } catch (err) {
      console.error('Stratz recent fetch history failed: ', err)
      return { error: err instanceof Error ? err.message : String(err) }
    }
  })

  

  ipcMain.handle('steam-login', async () => {
    return new Promise<string | null>((resolve) => {
      const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Sign in via Steam',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      authWindow.on('closed', () => {
        resolve(null)
      })
    })
  })
  ipcMain.handle('get-config', () => {
    return config
  })

  ipcMain.handle('set-config', (_event, newConfig) => {
    config = { ...config, ...newConfig }
    saveConfig(config)

    // broadcast update
    if (controlWindow) {
      controlWindow.webContents.send('config-updated', config)
    }

    return config
  })

  ipcMain.on('win-minimize', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win?.minimize()
  })

  ipcMain.on('win-maximize', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('win-close', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win?.close()
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createOverlayWindow()
  createTray()
  registerIpcHandlers()
  startTracking()

  // Start GSI Server
  gsiServer = createGSIServer((ui) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dota-gsi-stream', ui)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow()
    }
  })
})

app.on('will-quit', () => {
  // Clean shutdown — no zombie processes
  if (gsiServer) {
    gsiServer.close()
  }
  if (tray) tray.destroy()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !tray) {
    app.quit()
  }
})
