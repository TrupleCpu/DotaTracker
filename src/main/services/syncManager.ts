import { fetchMatches } from '../stratz/services/fetchMatches'
import { insertMatch, type Match } from '../db/matchesRepo'
import { loadConfig } from '../config'
import { state } from '../state'

let previousState = ''

export function handleGsiStateChange(currentState: string, steamId: number) {
  if (previousState === 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS' && 
      (currentState === 'DOTA_GAMERULES_STATE_POST_GAME' || currentState === 'DOTA_GAMERULES_STATE_DISCONNECT')) {
      
      // Match ended! Trigger sync after a 60-second delay to allow Stratz to parse the match
      setTimeout(() => {
        runSync(steamId)
      }, 60 * 1000)
  }
  previousState = currentState
}

export async function runSync(steamId: number) {
  try {
    const config = loadConfig()
    if (!config.autoSyncMatches) return

    const data = await fetchMatches(steamId, { take: 5 }) as { player?: { matches?: import('../../renderer/src/types/api').RawMatch[] } }
    const matches = data?.player?.matches || []
    
    matches.forEach(m => {
      insertMatch(m as Match, steamId)
    })

    if (state.mainWindow) {
      state.mainWindow.webContents.send('match-history-updated')
    }
    if (state.controlWindow) {
      state.controlWindow.webContents.send('match-history-updated')
    }
  } catch (err) {
    console.error('Error during auto-sync:', err)
  }
}


