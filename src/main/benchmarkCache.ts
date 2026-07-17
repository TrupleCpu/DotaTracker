import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export const benchmarkCache: Record<number, Record<string, unknown>> = {}
export const heroMap: Map<string, number> = new Map()

export function loadBenchmarks(): void {
  let baseDir = path.join(__dirname, '../../src/main/data')
  if (app.isPackaged || !fs.existsSync(path.join(baseDir, 'benchmarks.json'))) {
    baseDir = path.join(process.resourcesPath, 'data')
  }

  try {
    const raw = fs.readFileSync(path.join(baseDir, 'benchmarks.json'), 'utf-8')
    const data = JSON.parse(raw)
    for (const [id, d] of Object.entries(data)) {
      benchmarkCache[Number(id)] = d as Record<string, unknown>
    }
    console.log(`[BENCHMARK] Loaded ${Object.keys(benchmarkCache).length} hero benchmarks`)
  } catch (err) {
    console.error('[BENCHMARK] Failed to load benchmarks.json:', err)
  }

  try {
    const raw = fs.readFileSync(path.join(baseDir, 'heroes.json'), 'utf-8')
    const heroes = JSON.parse(raw)
    for (const h of heroes) {
      heroMap.set(h.name, h.id)
    }
    console.log(`[BENCHMARK] Loaded ${heroMap.size} hero name mappings`)
  } catch (err) {
    console.error('[BENCHMARK] Failed to load heroes.json:', err)
  }
}
