import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export const heroMap: Map<string, number> = new Map()

const CACHE_FILE = 'benchmarks-cache.json'
const STALE_DAYS = 7

let benchmarksPromise: Promise<Record<string, unknown>> | null = null

function loadHeroMap(): void {
  try {
    let baseDir: string
    if (app.isPackaged) {
      baseDir = path.join(process.resourcesPath, 'data')
    } else {
      baseDir = path.join(__dirname, '../../src/main/data')
    }
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

loadHeroMap()

export function prewarmBenchmarks(): void {
  getBenchmarksData().catch((err) => console.error('[BENCHMARK] Prewarm failed:', err))
}

export async function getBenchmarksData(): Promise<Record<string, unknown>> {
  if (benchmarksPromise) return benchmarksPromise

  benchmarksPromise = (async () => {
    const cachePath = path.join(app.getPath('userData'), CACHE_FILE)

    try {
      const stat = fs.statSync(cachePath)
      const ageMs = Date.now() - stat.mtimeMs
      const ageDays = ageMs / (1000 * 60 * 60 * 24)
      if (ageDays < STALE_DAYS) {
        const raw = fs.readFileSync(cachePath, 'utf-8')
        console.log('[BENCHMARK] Loaded from cache')
        return JSON.parse(raw)
      }
      console.log('[BENCHMARK] Cache stale, refreshing...')
    } catch {
      console.log('[BENCHMARK] No cache found, fetching...')
    }

    const benchmarks: Record<string, unknown> = {}
    const heroIds = [...heroMap.values()]

    for (const id of heroIds) {
      try {
        const res = await fetch(`https://api.opendota.com/api/benchmarks?hero_id=${id}`)
        if (res.ok) {
          benchmarks[String(id)] = await res.json()
        }
        await new Promise((r) => setTimeout(r, 2000))
      } catch (err) {
        console.error(`[BENCHMARK] Failed to fetch hero ${id}:`, err)
      }
    }

    try {
      fs.writeFileSync(cachePath, JSON.stringify(benchmarks))
      console.log(`[BENCHMARK] Fetched and cached ${Object.keys(benchmarks).length} hero benchmarks`)
    } catch (err) {
      console.error('[BENCHMARK] Failed to write cache file:', err)
    }

    return benchmarks
  })()

  try {
    return await benchmarksPromise
  } catch (err) {
    console.error('[BENCHMARK] Fetch failed, resetting:', err)
    benchmarksPromise = null
    throw err
  }
}
