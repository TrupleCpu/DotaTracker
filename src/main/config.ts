import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export type AppConfig = {
  overlayEnabled: boolean
  opacity: number
  position: 'bottom-left' | 'bottom-right'
  refreshRate: number
  showBenchmarks: boolean
  autoSyncMatches: boolean
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json')

const defaultConfig: AppConfig = {
  overlayEnabled: true,
  opacity: 0.9,
  position: 'bottom-left',
  refreshRate: 100,
  showBenchmarks: true,
  autoSyncMatches: true
}

export function loadConfig(): AppConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2))
      return defaultConfig
    }

    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
    return { ...defaultConfig, ...parsed }
  } catch {
    return defaultConfig
  }
}

export function saveConfig(config: AppConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}
