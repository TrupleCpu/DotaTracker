import http from 'http'
import { heroMap } from './benchmarkCache'
import { handleGsiStateChange } from './services/syncManager'
import { getActiveSteamId } from './ipc/steam'
import itemsData from './data/items.json'
import type { RawGSIData, GSIUIState } from './types/gsi'
const AUTH_TOKEN = '@@@!!!aBcasdc'

let roshanStatus = 'Alive'
let roshanDeathTime: number | null = null

const itemKeyToId: Record<string, number> = {}
for (const [key, val] of Object.entries(itemsData)) {
  if (val && typeof val === 'object' && 'id' in val) {
    itemKeyToId[key] = (val as { id: number }).id
  }
}

function sanitizeItemName(name: string | unknown): string {
  if (typeof name !== 'string' || !name || name === 'empty') return 'empty'
  return name.replace('item_', '').replace(/_/g, ' ')
}

function getItemId(name: string | unknown): number {
  if (typeof name !== 'string' || !name || name === 'empty') return 0
  const key = name.replace(/^item_/, '')
  return itemKeyToId[key] ?? 0
}

function processGSI(data: RawGSIData): GSIUIState {
  const ui: Partial<GSIUIState> = {}

  if (data.map) {
    const clock = data.map.clock_time ?? 0
    const state = data.map.game_state ?? ''
    const currDire = data.map.dire_score ?? 0
    const prevDire = data.previously?.map?.dire_score ?? null

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
    ui.player = {
      gold: data.player.gold ?? 0,
      net_worth: data.player.net_worth ?? 0,
      kills: data.player.kills ?? 0,
      deaths: data.player.deaths ?? 0,
      assists: data.player.assists ?? 0,
      gpm: data.player.gpm ?? 0,
      xpm: data.player.xpm ?? 0,
      lh: data.player.last_hits ?? 0,
      denies: data.player.denies ?? 0,
      team: data.player.team_name ?? 'unknown'
    }
  }

  if (data.hero?.name) {
    const heroId = heroMap.get(data.hero.name) ?? null

    ui.hero = {
      id: heroId,
      name: (data.hero.name ?? '').replace('npc_dota_hero_', '').replace(/_/g, ' '),
      health: data.hero.health ?? 0,
      max_health: data.hero.max_health ?? 0,
      mana: data.hero.mana ?? 0,
      max_mana: data.hero.max_mana ?? 0,
      level: data.hero.level ?? 0,
      alive: data.hero.alive ?? true,
      respawn_seconds: data.hero.respawn_seconds ?? 0
    }
  }

  if (data.items) {
    const mainInventory: string[] = []
    const inventoryIds: number[] = []
    const backpack: string[] = []

    for (let i = 0; i < 6; i++) {
      const slotName = data.items[`slot${i}`]?.name
      mainInventory.push(sanitizeItemName(slotName))
      inventoryIds.push(getItemId(slotName))
    }
    for (let i = 6; i < 9; i++) {
      backpack.push(sanitizeItemName(data.items[`slot${i}`]?.name))
    }

    ui.items = {
      inventory: mainInventory,
      inventory_ids: inventoryIds,
      backpack: backpack,
      teleport: sanitizeItemName(data.items.slot9?.name),
      neutral: sanitizeItemName(data.items.neutral0?.name)
    }
  }

  return ui as GSIUIState
}

export function createGSIServer(onData: (ui: GSIUIState) => void): http.Server {
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

        if (!data.auth || data.auth.token !== AUTH_TOKEN) {
          res.writeHead(403)
          res.end('Unauthorized')
          return
        }

        const ui = processGSI(data)

        // GSI does not provide steamId directly in a reliable way, we should grab the logged-in steamId
        getActiveSteamId().then((result) => {
          if ('steamId' in result && data.map && data.map.game_state) {
            handleGsiStateChange(data.map.game_state, result.steamId)
          }
        })

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

  server.listen(4000, '127.0.0.1')

  return server
}
