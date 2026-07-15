import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export interface LlmConfig {
  provider: 'openai' | 'nvidia' | 'claude' | 'gemini' | 'groq'
  apiKey: string
  baseUrl?: string
  model?: string
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'llm-config.json')

export function loadLlmConfig(): LlmConfig | null {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    return null
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export function clearLlmConfig(): void {
  try {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
  } catch {}
}
