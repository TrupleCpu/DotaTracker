import { ipcMain, app } from 'electron'
import { readFileSync } from 'fs'
import { join } from 'path'
import { calculateDraftWinProbability } from '../stratz/services/draftService'
import { isLlmConfigured, generateDraftSuggestion } from '../services/llmService'
import { startDraftEngine, stopDraftEngine } from '../draft-engine/draftEngine'

// In-memory cache for draft suggestions
const draftCache = new Map<string, any>()
let lastCallTime = 0
const MIN_COOLDOWN_MS = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getHeroName(id: number): string | null {
  try {
    const filePath = app.isPackaged
      ? join(process.resourcesPath, 'data/heroes.json')
      : join(app.getAppPath(), 'src/main/data/heroes.json')
    const heroes = JSON.parse(readFileSync(filePath, 'utf-8'))
    const hero = heroes.find((h: any) => h.id === id)
    return hero?.localized_name ?? null
  } catch {
    return null
  }
}

export function registerDraftHandlers(): void {
  ipcMain.handle(
    'analyze-draft-suggestion',
    async (_event, radiantIds: number[], direIds: number[], playerTeam: string) => {
      if (!isLlmConfigured()) {
        return { error: 'LLM not configured', suggestions: null }
      }

      const radiantHeroes = radiantIds.map((id) => getHeroName(id)).filter(Boolean) as string[]
      const direHeroes = direIds.map((id) => getHeroName(id)).filter(Boolean) as string[]

      if (radiantHeroes.length === 0 && direHeroes.length === 0) {
        draftCache.clear() // Clear cache on new draft reset
        return { error: 'No heroes in draft yet', suggestions: null }
      }

      // Check cache using sorted hero IDs to make it order-independent
      const cacheKey = `${[...radiantIds].sort().join(',')}|${[...direIds].sort().join(',')}|${playerTeam}`
      if (draftCache.has(cacheKey)) {
        return draftCache.get(cacheKey)
      }

      // Cooldown safeguard to enforce a minimum of 2 seconds between calls
      const now = Date.now()
      const timeSinceLastCall = now - lastCallTime
      if (timeSinceLastCall < MIN_COOLDOWN_MS) {
        await sleep(MIN_COOLDOWN_MS - timeSinceLastCall)
      }
      lastCallTime = Date.now()

      try {
        const result = await generateDraftSuggestion(radiantHeroes, direHeroes, playerTeam)
        const response = { suggestions: result.suggestions, error: null }
        draftCache.set(cacheKey, response)
        return response
      } catch (err) {
        console.error('LLM draft suggestion failed:', err)
        return { error: err instanceof Error ? err.message : String(err), suggestions: null }
      }
    }
  )

  ipcMain.handle('analyze-draft-win-probability', async (_event, radiantIds: number[], direIds: number[]) => {
    return await calculateDraftWinProbability(radiantIds, direIds)
  })

  ipcMain.handle('set-draft-analyzer', (_event, enabled: boolean) => {
    if (enabled) {
      startDraftEngine()
    } else {
      stopDraftEngine()
      draftCache.clear() // Clear cache when disabled
    }
  })
}

