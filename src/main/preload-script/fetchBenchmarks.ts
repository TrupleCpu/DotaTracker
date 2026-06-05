import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const HEROES_PATH = path.join(__dirname, '../data/heroes.json')
const OUTPUT_PATH = path.join(__dirname, '../data/benchmarks.json')
const heroes = JSON.parse(fs.readFileSync(HEROES_PATH, 'utf-8'))

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms))

async function fetchBenchmark(heroId: number): Promise<unknown> {
  const res = await fetch(`https://api.opendota.com/api/benchmarks?hero_id=${heroId}`)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json()
}
async function buildCache(): Promise<void> {
  const cache: Record<number, unknown> = {}

  console.log('Starting benchmark preload.....')

  for (const hero of heroes) {
    try {
      cache[hero.id] = await fetchBenchmark(hero.id)

      console.log('fetching: ' + hero.id)

      await delay(2000)
    } catch (err) {
      console.log('Failed hero: ' + hero.id, err)
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cache, null, 2))

  console.log('Benchmark Saved!!')
}

buildCache()
