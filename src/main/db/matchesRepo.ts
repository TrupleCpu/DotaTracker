import { db } from './index'

export interface MatchPlayer {
  steamAccountId: number
  heroId: number
  isVictory: boolean
  position?: string

  item0Id?: number
  item1Id?: number
  item2Id?: number
  item3Id?: number
  item4Id?: number
  item5Id?: number
}

export interface Match {
  id: number
  durationSeconds: number
  endDateTime: number
  players: MatchPlayer[]
}

interface CacheEntry<T> {
  data: T
  ts: number
}

const QUERY_CACHE_TTL_MS = 5 * 60 * 1000
const queryCache = new Map<string, CacheEntry<unknown>>()

function cacheGet<T>(key: string): T | null {
  const entry = queryCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > QUERY_CACHE_TTL_MS) {
    queryCache.delete(key)
    return null
  }
  return entry.data as T
}

function cacheSet<T>(key: string, data: T): void {
  queryCache.set(key, { data, ts: Date.now() })
}

export function insertMatch(match: Match, steamId: number): void {
  if (!match || !match.players || match.players.length === 0) return

  const p = match.players.find((player) => player.steamAccountId === steamId) ?? match.players[0]

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO matches (match_id, steam_account_id, hero_id, is_win, duration_seconds, start_date_time, json_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    match.id,
    steamId,
    p.heroId,
    p.isVictory ? 1 : 0,
    match.durationSeconds,
    match.endDateTime,
    JSON.stringify(match)
  )
}

export function insertMatchBatch(matches: Match[], steamId: number): number {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO matches (match_id, steam_account_id, hero_id, is_win, duration_seconds, start_date_time, json_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  let count = 0
  const tx = db.transaction(() => {
    for (const match of matches) {
      if (!match || !match.players || match.players.length === 0) continue
      const p =
        match.players.find((player) => player.steamAccountId === steamId) ?? match.players[0]
      const result = insert.run(
        match.id,
        steamId,
        p.heroId,
        p.isVictory ? 1 : 0,
        match.durationSeconds,
        match.endDateTime,
        JSON.stringify(match)
      )
      if (result.changes > 0) count++
    }
  })
  tx()
  return count
}

export function getLocalMatches(steamId: number, limit = 50, skip = 0): Match[] {
  const stmt = db.prepare(
    'SELECT json_data FROM matches WHERE steam_account_id = ? ORDER BY start_date_time DESC LIMIT ? OFFSET ?'
  )
  const rows = stmt.all(steamId, limit, skip) as { json_data: string }[]
  return rows.map((r) => JSON.parse(r.json_data) as Match)
}

export function countLocalMatches(steamId: number): number {
  const stmt = db.prepare('SELECT COUNT(*) as c FROM matches WHERE steam_account_id = ?')
  const row = stmt.get(steamId) as { c: number }
  return row.c
}

export function getLocalHeroMatches(
  steamId: number,
  heroId: number,
  limit = 20,
  skip = 0
): Match[] {
  const stmt = db.prepare(
    'SELECT json_data FROM matches WHERE steam_account_id = ? AND hero_id = ? ORDER BY start_date_time DESC LIMIT ? OFFSET ?'
  )
  const rows = stmt.all(steamId, heroId, limit, skip) as { json_data: string }[]
  return rows.map((r) => JSON.parse(r.json_data) as Match)
}

export function getLocalMatchById(matchId: number): Match | null {
  const stmt = db.prepare('SELECT json_data FROM matches WHERE match_id = ?')
  const row = stmt.get(matchId) as { json_data: string } | undefined
  return row ? (JSON.parse(row.json_data) as Match) : null
}

export function getEarliestMatchDate(steamId: number): number | null {
  const stmt = db.prepare(
    'SELECT MIN(start_date_time) as earliest FROM matches WHERE steam_account_id = ?'
  )
  const row = stmt.get(steamId) as { earliest: number | null }
  return row.earliest ?? null
}

export interface SyncState {
  steam_id: number
  status: 'idle' | 'syncing' | 'complete' | 'error'
  cursor_skip: number
  synced_count: number
  total_count: number
  last_synced_at: number | null
}

export function upsertSyncState(state: SyncState): void {
  const stmt = db.prepare(`
    INSERT INTO sync_state (steam_id, status, cursor_skip, synced_count, total_count, last_synced_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(steam_id) DO UPDATE SET
      status = excluded.status,
      cursor_skip = excluded.cursor_skip,
      synced_count = excluded.synced_count,
      total_count = excluded.total_count,
      last_synced_at = excluded.last_synced_at
  `)
  stmt.run(
    state.steam_id,
    state.status,
    state.cursor_skip,
    state.synced_count,
    state.total_count,
    state.last_synced_at ?? null
  )
}

export function getSyncState(steamId: number): SyncState | null {
  const stmt = db.prepare('SELECT * FROM sync_state WHERE steam_id = ?')
  const row = stmt.get(steamId) as SyncState | undefined
  return row ?? null
}

export function getHeroItemFrequency(
  steamId: number,
  heroId: number
): { itemId: number; count: number }[] {
  const cacheKey = `freq:${steamId}:${heroId}`
  const cached = cacheGet<{ itemId: number; count: number }[]>(cacheKey)
  if (cached) return cached

  const stmt = db.prepare(
    `SELECT json_extract(json_data, '$.players') as players_json
     FROM matches WHERE steam_account_id = ? AND hero_id = ?
     ORDER BY start_date_time DESC`
  )
  const rows = stmt.all(steamId, heroId) as { players_json: string | null }[]

  const freq = new Map<number, number>()

  for (const row of rows) {
    if (!row.players_json) continue
    const players = JSON.parse(row.players_json) as MatchPlayer[]
    const player = players.find((p) => p.steamAccountId === steamId)
    if (!player) continue

    const slots = [
      player.item0Id,
      player.item1Id,
      player.item2Id,
      player.item3Id,
      player.item4Id,
      player.item5Id
    ]
    for (const itemId of slots) {
      if (itemId && itemId > 0) {
        freq.set(itemId, (freq.get(itemId) || 0) + 1)
      }
    }
  }

  const result: { itemId: number; count: number }[] = []
  for (const [itemId, count] of freq) {
    result.push({ itemId, count })
  }
  result.sort((a, b) => b.count - a.count)
  cacheSet(cacheKey, result)
  return result
}

export function getMostPlayedPosition(steamId: number, heroId: number): string | null {
  const cacheKey = `pos:${steamId}:${heroId}`
  const cached = cacheGet<string | null>(cacheKey)
  if (cached !== null) return cached

  const stmt = db.prepare(
    `SELECT json_extract(json_data, '$.players') as players_json
     FROM matches WHERE steam_account_id = ? AND hero_id = ?
     ORDER BY start_date_time DESC`
  )
  const rows = stmt.all(steamId, heroId) as { players_json: string | null }[]

  const posCount = new Map<string, number>()

  for (const row of rows) {
    if (!row.players_json) continue
    const players = JSON.parse(row.players_json) as MatchPlayer[]
    const player = players.find((p) => p.steamAccountId === steamId)
    if (!player?.position) continue
    posCount.set(player.position, (posCount.get(player.position) || 0) + 1)
  }

  let best: string | null = null
  let bestCount = 0
  for (const [pos, count] of posCount) {
    if (count > bestCount) {
      bestCount = count
      best = pos
    }
  }
  cacheSet(cacheKey, best)
  return best
}

export function getHeroTimingsCache(
  heroId: number,
  bracketIds: string,
  positionId: string | null
): { data_json: string; fetched_at: number } | null {
  const stmt = db.prepare(
    'SELECT data_json, fetched_at FROM hero_timings_cache WHERE hero_id = ? AND bracket_ids = ? AND position_id IS ?'
  )
  const row = stmt.get(heroId, bracketIds, positionId) as
    | { data_json: string; fetched_at: number }
    | undefined
  return row ?? null
}

const PLAYER_CACHE_TTL_MS = 5 * 60 * 1000

export function getPlayerCache<T>(steamId: number): { data: T; fetchedAt: number } | null {
  const stmt = db.prepare('SELECT data_json, fetched_at FROM player_cache WHERE steam_id = ?')
  const row = stmt.get(steamId) as { data_json: string; fetched_at: number } | undefined
  if (!row) return null
  const age = Date.now() - row.fetched_at
  if (age > PLAYER_CACHE_TTL_MS) return null
  return { data: JSON.parse(row.data_json) as T, fetchedAt: row.fetched_at }
}

export function setPlayerCache<T>(steamId: number, data: T): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO player_cache (steam_id, data_json, fetched_at)
    VALUES (?, ?, ?)
  `)
  stmt.run(steamId, JSON.stringify(data), Date.now())
}

export function setHeroTimingsCache(
  heroId: number,
  bracketIds: string,
  positionId: string | null,
  dataJson: string
): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO hero_timings_cache (hero_id, bracket_ids, position_id, data_json, fetched_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  stmt.run(heroId, bracketIds, positionId, dataJson, Date.now())
}
