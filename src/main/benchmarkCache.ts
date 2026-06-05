import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export const benchmarkCache: Record<number, Record<string, unknown>> = {}
export const heroMap: Map<string, number> = new Map()

export function loadBenchmarks(): void {
  const filePath = app.isPackaged
    ? path.join(process.resourcesPath, 'data/benchmarks.json')
    : path.join(process.cwd(), 'src/main/data/benchmarks.json')

  const heroPath = app.isPackaged
    ? path.join(process.resourcesPath, 'data/heroes.json')
    : path.join(process.cwd(), 'src/main/data/heroes.json')

  console.log('[BENCHMARK] Loading from:', filePath)

  const benchmarks = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const heroes = JSON.parse(fs.readFileSync(heroPath, 'utf-8'))

  Object.assign(benchmarkCache, benchmarks)

  for (const hero of heroes) {
    heroMap.set(hero.name, hero.id)
    heroMap.set(`npc_dota_hero_${hero.name}`, hero.id)
  }

  console.log('[BENCHMARK] Loaded', Object.keys(benchmarkCache).length, 'heroes')
}
