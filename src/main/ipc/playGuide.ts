import { ipcMain } from 'electron'
import { savePlayGuide, getPlayGuide } from '../db/playGuideRepo'
import { state } from '../state'

export function registerPlayGuideHandlers(): void {
  ipcMain.handle('get-play-guide', (_e, heroId: number) => {
    return getPlayGuide(heroId)
  })

  ipcMain.handle('save-play-guide', (_e, heroId: number, slots: { slotIndex: number; itemId: number; targetMinute: number }[]) => {
    savePlayGuide(heroId, slots)
    state.mainWindow?.webContents.send('guide-updated', heroId)
    state.controlWindow?.webContents.send('guide-updated', heroId)
    return true
  })
}
