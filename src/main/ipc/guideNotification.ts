import { ipcMain } from 'electron'
import { showGuideNotification } from '../windows/guideNotificationWindow'
import { state } from '../state'

export function registerGuideNotificationHandlers(): void {
  ipcMain.on('show-guide-notification', (_e, data: { itemName: string; itemImg: string | null; targetMinute: number; acquiredAtClock: number; diffSeconds: number }) => {
    showGuideNotification(data, state.overlayBounds ?? undefined)
  })
}
