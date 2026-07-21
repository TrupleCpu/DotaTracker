import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export const heroMap: Map<string, number> = new Map()

function loadHeroMap(): void {
  try {
    let baseDir: string
    if (app.isPackaged) {
      baseDir = path.join(process.resourcesPath, 'data')
    } else {
      baseDir = path.join(__dirname, '../../src/main/data')
    }
    const heroesPath = path.join(baseDir, 'heroes.json')
    const raw = fs.readFileSync(heroesPath, 'utf-8')
    const heroes = JSON.parse(raw)
    for (const h of heroes) {
      heroMap.set(h.name, h.id)
    }
  } catch (err) {
    console.error('[BENCHMARK] Failed to load heroes.json:', err)
  }
}

loadHeroMap()

const CACHE_DIR = 'benchmarks-cache'
const STALE_MS = 7 * 24 * 60 * 60 * 1000

function getCachePath(heroId: number): string {
  return path.join(app.getPath('userData'), CACHE_DIR, `${heroId}.json`)
}

export async function getHeroBenchmarks(heroId: number): Promise<Record<string, unknown> | null> {
  const cachePath = getCachePath(heroId)

  try {
    const stat = fs.statSync(cachePath)
    if (Date.now() - stat.mtimeMs < STALE_MS) {
      const raw = fs.readFileSync(cachePath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {
  }

  try {
    const res = await fetch(`https://api.opendota.com/api/benchmarks?hero_id=${heroId}`)
    if (!res.ok) {
      console.error(`[BENCHMARK] HTTP ${res.status} for hero ${heroId}`)
      return null
    }
    const data = await res.json()
    try {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true })
      fs.writeFileSync(cachePath, JSON.stringify(data))
    } catch (err) {
      console.error('[BENCHMARK] Failed to write cache:', err)
    }
    return data
  } catch (err) {
    console.error(`[BENCHMARK] Fetch failed for hero ${heroId}:`, (err as Error)?.message ?? err)
    return null
  }
}
