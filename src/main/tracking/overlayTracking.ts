import { windowManager } from 'node-window-manager'
import { basename } from 'path'
import { state } from '../state'
import { WIDGET_HEIGHT, WIDGET_WIDTH } from '../windows/overlayWindow'
import { hideGuideNotification } from '../windows/guideNotificationWindow'

type Bounds = { x: number; y: number; width: number; height: number }

function getSafeBounds(activeWindow: { getBounds: () => Bounds | null }): Bounds | null {
  try {
    const raw = activeWindow.getBounds?.()
    if (!raw) return null
    return {
      x: Math.floor(raw.x),
      y: Math.floor(raw.y),
      width: Math.floor(raw.width),
      height: Math.floor(raw.height)
    }
  } catch {
    return null
  }
}

export function startTracking(): void {
  setInterval(() => {
    try {
      if (!state.config.overlayEnabled) {
        if (state.mainWindow?.isVisible()) state.mainWindow.hide()
        return
      }

      const activeWindow = windowManager.getActiveWindow()
      const exeName = basename(activeWindow?.path || '').toLowerCase()
      const isDota = exeName === 'dota2.exe'

      if (isDota) {
        const bounds = getSafeBounds(activeWindow as unknown as { getBounds: () => Bounds | null })

        if (bounds && state.mainWindow) {
          const overlayBounds = {
            x: bounds.x ,
            y: bounds.y + 125,
            width: WIDGET_WIDTH,
            height: WIDGET_HEIGHT
          }
          state.mainWindow.setBounds(overlayBounds)
          state.overlayBounds = overlayBounds
        }

        if (state.mainWindow && !state.mainWindow.isVisible()) {
          state.mainWindow.showInactive()
          state.mainWindow.setAlwaysOnTop(true, 'screen-saver')
        }
      } else {
        if (state.mainWindow?.isVisible()) state.mainWindow.hide()
        hideGuideNotification()
      }
    } catch {
    }
  }, 250)
}
