import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export const benchmarkCache: Record<number, Record<string, unknown>> = {}
export const heroMap: Map<string, number> = new Map()

export function loadBenchmarks(): void {
  let filePath = path.join(__dirname, '../../src/main/data/benchmarks.json')
  let heroPath = path.join(__dirname, '../../src/main/data/heroes.json')

  if (app.isPackaged || !fs.existsSync(filePath)) {
    if (!app.isPackaged && !fs.existsSync(filePath)) {
      console.error(
        '[BENCHMARK ERROR] Data files are missing from src/main/data/! Run your scraper script first.'
      )
    }
    filePath = path.join(process.resourcesPath, 'data/benchmarks.json')
    heroPath = path.join(process.resourcesPath, 'data/heroes.json')
  }

  console.log('[BENCHMARK] Loading from:', filePath)
}
