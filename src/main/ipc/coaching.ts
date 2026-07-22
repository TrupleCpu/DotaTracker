import { ipcMain } from 'electron'
import { loadLlmConfig, saveLlmConfig, clearLlmConfig, type LlmConfig } from '../services/configService'
import { generateMatchCoaching, generateSessionReview } from '../services/llmService'
import type { SingleMatchContext, SessionMatchSummary } from '../services/llmService'

export function registerCoachingHandlers(): void {
  ipcMain.handle('get-llm-config', () => {
    const cfg = loadLlmConfig()
    return { configured: cfg !== null, provider: cfg?.provider ?? null, model: cfg?.model ?? null }
  })

  ipcMain.handle('set-llm-config', (_e, config: LlmConfig) => {
    saveLlmConfig({
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model
    })
    return true
  })

  ipcMain.handle('clear-llm-config', () => {
    clearLlmConfig()
    return true
  })

  ipcMain.handle('generate-coaching', async (_e, ctx: SingleMatchContext) => {
    try {
      return await generateMatchCoaching(ctx)
    } catch (err) {
      console.error('generate-coaching failed:', err)
      return { err: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('generate-session-review', async (_e, matches: SessionMatchSummary[]) => {
    try {
      return await generateSessionReview(matches)
    } catch (err) {
      console.error('generate-session-review failed:', err)
      return { err: err instanceof Error ? err.message : String(err) }
    }
  })
}
