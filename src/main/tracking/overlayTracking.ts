import { windowManager } from 'node-window-manager'
import { state } from '../state'
import { WIDGET_HEIGHT, WIDGET_WIDTH } from '../windows/overlayWindow'

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
  } catch (err) {
    console.error('Failed to get safe bounds:', err)
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
      const title = activeWindow?.getTitle() || ''

      if (title.toLowerCase().includes('dota 2')) {
        const bounds = getSafeBounds(activeWindow as unknown as { getBounds: () => Bounds | null })

        if (bounds && state.mainWindow) {
          state.mainWindow.setBounds({
            x: bounds.x + 8,
            y: bounds.y + 125,
            width: WIDGET_WIDTH,
            height: WIDGET_HEIGHT
          })
        }

        if (state.mainWindow && !state.mainWindow.isVisible()) {
          state.mainWindow.showInactive()
          state.mainWindow.setAlwaysOnTop(true, 'screen-saver')
        } else if (state.mainWindow?.isVisible()) {
          state.mainWindow.hide()
        }
      }
    } catch (err) {
      console.error('Overlay visibility check error:', err)
    }
  })
}
