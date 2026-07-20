import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

const NOTIFICATION_WIDTH = 220
const NOTIFICATION_HEIGHT = 100

let notificationWindow: BrowserWindow | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

export function createGuideNotificationWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    focusable: false,
    fullscreenable: false,
    hasShadow: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.setIgnoreMouseEvents(true, { forward: true })
  win.setSkipTaskbar(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?view=guide-notification`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { view: 'guide-notification' }
    })
  }

  notificationWindow = win
  return win
}

export function showGuideNotification(
  data: { itemName: string; itemImg: string | null; targetMinute: number; acquiredAtClock: number; diffSeconds: number },
  overlayBounds?: { x: number; y: number; width: number; height: number }
): void {
  if (!notificationWindow || notificationWindow.isDestroyed()) return

  notificationWindow.webContents.send('guide-notification-data', data)

  if (overlayBounds) {
    notificationWindow.setBounds({
      x: overlayBounds.x,
      y: overlayBounds.y + overlayBounds.height + 4,
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT
    })
  }

  notificationWindow.showInactive()
  notificationWindow.setAlwaysOnTop(true, 'screen-saver')

  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (notificationWindow && !notificationWindow.isDestroyed()) {
      notificationWindow.hide()
    }
  }, 4000)
}

export function hideGuideNotification(): void {
  if (hideTimer) clearTimeout(hideTimer)
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.hide()
  }
}
