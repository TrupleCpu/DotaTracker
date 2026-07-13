import { ipcMain } from 'electron'
import { getMatchDetails } from '../stratz/services/matchDetails'
import { fetchMatches, FetchMatchesOptions } from '../stratz/services/fetchMatches'
import { getPlayerData } from '../stratz/services/playerService'

export function registerMatchHandlers(): void {
  ipcMain.handle('fetch-match-details', async (_e, matchId: string | number) => {
    try {
      return await getMatchDetails(matchId)
    } catch (err) {
      console.error('STRATZ get match details failed.', err)
      return { err: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(
    'fetch-all-matches',
    async (_e, steamId: number | string, options: FetchMatchesOptions = {}) => {
      try {
        return await fetchMatches(steamId, options)
      } catch (err) {
        console.error('STRATZ get match details failed.', err)
        return { err: err instanceof Error ? err.message : String(err) }
      }
    }
  )

  ipcMain.handle('fetch-player-data', async (_e, steamId: number | string) => {
    try {
      return await getPlayerData(steamId)
    } catch (err) {
      console.error('STRATZ get match details failed.', err)
      return { err: err instanceof Error ? err.message : String(err) }
    }
  })
}
