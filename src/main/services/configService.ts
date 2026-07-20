import fs from 'fs'
import path from 'path'
import { app, safeStorage } from 'electron'

export interface LlmConfig {
  provider: 'openai' | 'nvidia' | 'claude' | 'gemini' | 'groq'
  apiKey: string
  baseUrl?: string
  model?: string
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'llm-config.enc')

function encrypt(data: string): Buffer {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(data)
  }
  return Buffer.from(data, 'utf-8')
}

function decrypt(buffer: Buffer): string | null {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(buffer)
    }
    return buffer.toString('utf-8')
  } catch {
    return null
  }
}

export function loadLlmConfig(): LlmConfig | null {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    const raw = decrypt(fs.readFileSync(CONFIG_PATH))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  fs.writeFileSync(CONFIG_PATH, encrypt(JSON.stringify(config)))
}

export function clearLlmConfig(): void {
  try {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
  } catch {}
}
