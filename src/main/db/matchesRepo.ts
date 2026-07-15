import { db } from './index'

export function insertMatch(match: any, steamId: number) {
  if (!match || !match.players || match.players.length === 0) return;

  const p = match.players.find((player: any) => player.steamAccountId === steamId) || match.players[0]

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO matches (match_id, steam_account_id, hero_id, is_win, duration_seconds, start_date_time, json_data)
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

export function insertMatchBatch(matches: any[], steamId: number): number {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO matches (match_id, steam_account_id, hero_id, is_win, duration_seconds, start_date_time, json_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  let count = 0
  const tx = db.transaction(() => {
    for (const match of matches) {
      if (!match || !match.players || match.players.length === 0) continue
      const p = match.players.find((player: any) => player.steamAccountId === steamId) || match.players[0]
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

export function getLocalMatches(steamId: number, limit = 50, skip = 0) {
  const stmt = db.prepare('SELECT json_data FROM matches WHERE steam_account_id = ? ORDER BY start_date_time DESC LIMIT ? OFFSET ?')
  const rows = stmt.all(steamId, limit, skip)
  return rows.map((r: any) => JSON.parse(r.json_data))
}

export function countLocalMatches(steamId: number) {
  const stmt = db.prepare('SELECT COUNT(*) as c FROM matches WHERE steam_account_id = ?')
  const row = stmt.get(steamId) as { c: number }
  return row.c
}

export function getEarliestMatchDate(steamId: number): number | null {
  const stmt = db.prepare('SELECT MIN(start_date_time) as earliest FROM matches WHERE steam_account_id = ?')
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

export function upsertSyncState(state: SyncState) {
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
  stmt.run(state.steam_id, state.status, state.cursor_skip, state.synced_count, state.total_count, state.last_synced_at ?? null)
}

export function getSyncState(steamId: number): SyncState | null {
  const stmt = db.prepare('SELECT * FROM sync_state WHERE steam_id = ?')
  const row = stmt.get(steamId) as SyncState | undefined
  return row ?? null
}

export function getHeroItemFrequency(steamId: number, heroId: number): { itemId: number; count: number }[] {
  const stmt = db.prepare(
    'SELECT json_data FROM matches WHERE steam_account_id = ? AND hero_id = ? ORDER BY start_date_time DESC'
  )
  const rows = stmt.all(steamId, heroId) as { json_data: string }[]

  const freq = new Map<number, number>()

  for (const row of rows) {
    const match = JSON.parse(row.json_data)
    const player = match.players?.find((p: any) => p.steamAccountId === steamId)
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
  return result
}

export function getMostPlayedPosition(steamId: number, heroId: number): string | null {
  const stmt = db.prepare(
    'SELECT json_data FROM matches WHERE steam_account_id = ? AND hero_id = ? ORDER BY start_date_time DESC'
  )
  const rows = stmt.all(steamId, heroId) as { json_data: string }[]

  const posCount = new Map<string, number>()

  for (const row of rows) {
    const match = JSON.parse(row.json_data)
    const player = match.players?.find((p: any) => p.steamAccountId === steamId)
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
  stmt.run(heroId, bracketIds, positionId, dataJson, Math.floor(Date.now() / 1000))
}
