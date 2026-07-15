import { ipcMain } from 'electron'
import { getMatchDetails } from '../stratz/services/matchDetails'
import { fetchMatches, FetchMatchesOptions, fetchHeroMatches } from '../stratz/services/fetchMatches'
import { getPlayerData } from '../stratz/services/playerService'
import { runSync } from '../services/syncManager'
import { startFullSync } from '../services/fullSyncService'
import { getHeroTimings } from '../services/stratzTimingsService'
import { getSyncState, getHeroItemFrequency } from '../db/matchesRepo'

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

  ipcMain.handle(
    'fetch-hero-matches',
    async (_e, steamId: number | string, heroId: number, skip: number = 0, take: number = 20) => {
      try {
        return await fetchHeroMatches(steamId, heroId, skip, take)
      } catch (err) {
        console.error('STRATZ get hero matches failed.', err)
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

  ipcMain.handle('start-full-sync', async (_e, steamId: number) => {
    startFullSync(steamId)
  })

  ipcMain.handle('get-sync-progress', async (_e, steamId: number) => {
    const state = getSyncState(steamId)
    if (!state) {
      return { synced: 0, total: 0, status: 'idle' }
    }
    return {
      synced: state.synced_count,
      total: state.total_count,
      status: state.status
    }
  })

  ipcMain.handle('get-hero-item-frequency', async (_e, steamId: number, heroId: number) => {
    try {
      return getHeroItemFrequency(steamId, heroId)
    } catch (err) {
      console.error('Failed to get hero item frequency:', err)
      return []
    }
  })

  ipcMain.handle('get-hero-timings', async (_e, heroId: number, steamId: number) => {
    try {
      return await getHeroTimings(heroId, steamId)
    } catch (err) {
      console.error('Failed to get hero timings:', err)
      return { items: [], position: null }
    }
  })

  // Start background sync
  ipcMain.handle('trigger-startup-sync', async (_e, steamId: string) => {
    runSync(steamId)
  })
}
