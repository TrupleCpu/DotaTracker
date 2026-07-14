import { ipcMain } from 'electron'
import { analyzeHeroMatchups, calculateDraftWinProbability } from '../stratz/services/draftService'

export function registerDraftHandlers(): void {
  ipcMain.handle('analyze-hero-matchups', async (_event, heroId: number) => {
    return await analyzeHeroMatchups(heroId)
  })

  ipcMain.handle('analyze-draft-win-probability', async (_event, radiantIds: number[], direIds: number[]) => {
    return await calculateDraftWinProbability(radiantIds, direIds)
  })
}
