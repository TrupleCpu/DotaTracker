import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { encryptString, decryptString } from '../crypto'

export interface LlmConfig {
  provider: 'openai' | 'nvidia' | 'claude' | 'gemini' | 'groq'
  apiKey: string
  baseUrl?: string
  model?: string
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'llm-config.enc')

export function loadLlmConfig(): LlmConfig | null {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    const raw = decryptString(fs.readFileSync(CONFIG_PATH))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  fs.writeFileSync(CONFIG_PATH, encryptString(JSON.stringify(config)))
}

export function clearLlmConfig(): void {
  try {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
  } catch {
    /* file may not exist */
  }
}
