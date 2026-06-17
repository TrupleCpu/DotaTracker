import http from 'http'
import { benchmarkCache, heroMap, loadBenchmarks } from './benchmarkCache'

loadBenchmarks()

const AUTH_TOKEN = '@@@!!!aBcasdc'
let roshanStatus = 'Alive'
let roshanDeathTime: number | null = null

// Helper to sanitize item names cleanly
function sanitizeItemName(name: string | unknown): string {
  if (typeof name !== 'string' || !name || name === 'empty') return 'empty'
  return name.replace('item_', '').replace(/_/g, ' ')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processGSI(data: Record<string, any>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ui: Record<string, any> = {}

  if (data.map && typeof data.map === 'object') {
    const map = data.map as Record<string, unknown>
    const clock = (map.clock_time as number) ?? 0
    const state = (map.game_state as string) ?? 'unknown'
    const currDire = (map.dire_score as number) ?? 0
    const previously = data.previously as Record<string, unknown> | undefined
    const prevDire =
      ((previously?.map as unknown as Record<string, unknown>)?.dire_score as number) ?? null

    if (prevDire !== null && currDire > prevDire) {
      roshanDeathTime = clock
      roshanStatus = 'Dead'
    }

    if (roshanDeathTime !== null) {
      const elapsed = clock - roshanDeathTime
      if (elapsed >= 660) {
        roshanStatus = 'Alive'
        roshanDeathTime = null
      } else if (elapsed >= 480) {
        roshanStatus = `Respawning | ${660 - elapsed}s`
      } else {
        roshanStatus = `Dead | ${480 - elapsed}s`
      }
    }

    ui.clock = clock
    ui.game_state = state
    ui.roshan = roshanStatus
  }

  if (data.player) {
    const p = data.player
    ui.player = {
      gold: p.gold ?? 0,
      net_worth: p.net_worth ?? 0,
      kills: p.kills ?? 0,
      deaths: p.deaths ?? 0,
      assists: p.assists ?? 0,
      gpm: p.gpm ?? 0,
      xpm: p.xpm ?? 0,
      lh: p.last_hits ?? 0,
      denies: p.denies ?? 0
    }
  }

  if (data.hero) {
    const h = data.hero

    const heroId = heroMap.get(h.name)
    const benchmark = heroId ? benchmarkCache[heroId] : null
    const result = benchmark?.result

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gpm50 = (result as any)?.gold_per_min?.find((p: any) => p.percentile === 0.5)?.value ?? 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let xpm50 = (result as any)?.xp_per_min?.find((p: any) => p.percentile === 0.5)?.value ?? 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let kpm50 = (result as any)?.kills_per_min?.find((p: any) => p.percentile === 0.5)?.value ?? 0

    if (!gpm50)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gpm50 = (result as any)?.gold_per_min?.find((p: any) => p.value !== null)?.value ?? 0
    if (!xpm50)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      xpm50 = (result as any)?.xp_per_min?.find((p: any) => p.value !== null)?.value ?? 0
    if (!kpm50)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      kpm50 = (result as any)?.kills_per_min?.find((p: any) => p.value !== null)?.value ?? 0

    ui.hero = {
      name: (h.name ?? '').replace('npc_dota_hero_', '').replace(/_/g, ' '),
      health: h.health ?? 0,
      max_health: h.max_health ?? 0,
      mana: h.mana ?? 0,
      max_mana: h.max_mana ?? 0,
      level: h.level ?? 0,
      benchmark_gpm: gpm50,
      benchmark_xpm: xpm50,
      benchmark_kpm: kpm50,
      alive: h.alive ?? true,
      respawn_seconds: h.respawn_seconds ?? 0
    }
  }

  // New section: Safely extract and format items data
  if (data.items) {
    const mainInventory: string[] = []
    const backpack: string[] = []

    // Loop through standard slots (slot0 to slot5 are main inventory, slot6 to slot8 are backpack)
    for (let i = 0; i < 6; i++) {
      mainInventory.push(sanitizeItemName(data.items[`slot${i}`]?.name))
    }
    for (let i = 6; i < 9; i++) {
      backpack.push(sanitizeItemName(data.items[`slot${i}`]?.name))
    }

    ui.items = {
      inventory: mainInventory,
      backpack: backpack,
      teleport: sanitizeItemName(data.items.slot9?.name),
      neutral: sanitizeItemName(data.items.neutral0?.name)
    }
  }

  return ui
}

export function createGSIServer(onData: (ui: Record<string, unknown>) => void): http.Server {
  const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end()
      return
    }

    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        if (!body) {
          res.writeHead(400)
          res.end('Empty body')
          return
        }

        const data = JSON.parse(body)
        console.log('Received GSI data:', data)

        if (!data.auth || data.auth.token !== AUTH_TOKEN) {
          res.writeHead(403)
          res.end('Unauthorized')
          return
        }

        const ui = processGSI(data)
        onData(ui)

        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('OK')
      } catch (err) {
        console.error('GSI parsing error:', err)
        res.writeHead(500)
        res.end('Error')
      }
    })
  })

  server.listen(4000, '127.0.0.1', () => {
    console.log('[GSI] Server running on port 4000')
  })

  return server
}
